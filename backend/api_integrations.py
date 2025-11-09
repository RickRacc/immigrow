"""
API Integration Scripts for Immigrow
Fetches data from external APIs and transforms it for our database models
"""

import requests
from datetime import datetime, timedelta
import os
from typing import List, Dict, Optional
import time


class EventbriteAPI:
    """
    Eventbrite API Integration
    Fetches immigration-related events

    API Documentation: https://www.eventbrite.com/platform/api
    Authentication: OAuth token required
    """

    BASE_URL = "https://www.eventbriteapi.com/v3"

    def __init__(self, api_token: Optional[str] = None):
        self.api_token = api_token or os.getenv('EVENTBRITE_API_TOKEN')
        if not self.api_token:
            raise ValueError("Eventbrite API token is required. Set EVENTBRITE_API_TOKEN environment variable.")

        self.headers = {
            'Authorization': f'Bearer {self.api_token}',
            'Content-Type': 'application/json'
        }

    def search_events(self, keywords: List[str] = None, location: str = None, limit: int = 50) -> List[Dict]:
        """
        Search for immigration-related events

        Note: Eventbrite deprecated public event search. Using organization events instead.

        Args:
            keywords: List of search terms (default: immigration-related terms)
            location: Location string (e.g., "Texas", "New York, NY")
            limit: Maximum number of events to fetch

        Returns:
            List of event dictionaries ready for database insertion
        """
        # Eventbrite changed their API - public search no longer available with OAuth tokens
        # Instead, we'll search using their discovery endpoint or fetch from known organizations

        all_events = []

        try:
            # Try to get user's organizations first
            response = requests.get(
                f"{self.BASE_URL}/users/me/organizations/",
                headers=self.headers,
                timeout=10
            )

            if response.status_code == 200:
                orgs = response.json().get('organizations', [])
                print(f"Found {len(orgs)} organizations accessible with this token")

                # For each organization, get their events
                for org in orgs[:3]:  # Limit to first 3 orgs
                    org_id = org.get('id')
                    if org_id:
                        events_response = requests.get(
                            f"{self.BASE_URL}/organizations/{org_id}/events/",
                            headers=self.headers,
                            params={'status': 'live'},
                            timeout=10
                        )

                        if events_response.status_code == 200:
                            events = events_response.json().get('events', [])
                            print(f"Fetched {len(events)} events from org {org.get('name', org_id)}")

                            for event in events[:limit]:
                                transformed_event = self._transform_event(event)
                                if transformed_event:
                                    all_events.append(transformed_event)

                        time.sleep(1)  # Rate limiting
            else:
                print(f"Unable to access organizations: {response.status_code}")
                print(f"Response: {response.text[:200]}")

        except Exception as e:
            print(f"Error fetching Eventbrite data: {e}")

        # Remove duplicates by eventbrite_id
        seen = set()
        unique_events = []
        for event in all_events:
            if event['eventbrite_id'] not in seen:
                seen.add(event['eventbrite_id'])
                unique_events.append(event)

        return unique_events[:limit]

    def _transform_event(self, event_data: Dict) -> Optional[Dict]:
        """Transform Eventbrite event data to our database schema"""
        try:
            # Extract start date/time
            start = event_data.get('start', {})
            end = event_data.get('end', {})

            start_datetime = None
            if start.get('utc'):
                start_datetime = datetime.fromisoformat(start['utc'].replace('Z', '+00:00'))

            # Calculate duration
            duration_minutes = 60  # Default
            if start.get('utc') and end.get('utc'):
                start_dt = datetime.fromisoformat(start['utc'].replace('Z', '+00:00'))
                end_dt = datetime.fromisoformat(end['utc'].replace('Z', '+00:00'))
                duration_minutes = int((end_dt - start_dt).total_seconds() / 60)

            # Extract venue information
            venue = event_data.get('venue') or {}
            venue_name = venue.get('name', 'Online Event')
            venue_address = venue.get('address', {})
            city = venue_address.get('city', 'Virtual')
            state = venue_address.get('region', 'Online')
            location = f"{city}, {state}"

            # Extract name
            name = event_data.get('name', {})
            title = name.get('text', 'Untitled Event') if isinstance(name, dict) else str(name)

            # Extract description
            description = event_data.get('description', {})
            desc_text = description.get('text', '') if isinstance(description, dict) else str(description)

            return {
                'title': title[:255],  # Truncate to fit
                'date': start_datetime.date() if start_datetime else datetime.now().date(),
                'start_time': start.get('local', 'TBD')[:50],
                'end_time': end.get('local', 'TBD')[:50],
                'duration_minutes': duration_minutes,
                'location': location[:255],
                'city': city[:100],
                'state': state[:50],
                'venue_name': venue_name[:255],
                'description': desc_text,
                'external_url': event_data.get('url', ''),
                'image_url': event_data.get('logo', {}).get('url', ''),
                'eventbrite_id': event_data.get('id', ''),
                'timezone': start.get('timezone', 'UTC')
            }

        except Exception as e:
            print(f"Error transforming event: {e}")
            return None


class ProPublicaNonprofitAPI:
    """
    ProPublica Nonprofit Explorer API Integration
    Fetches nonprofit organizations (immigration-related)

    API Documentation: https://projects.propublica.org/nonprofits/api
    Authentication: None required

    NOTE: Using search endpoint instead of direct EIN lookup (more reliable)
    """

    BASE_URL = "https://projects.propublica.org/nonprofits/api/v2"

    # Immigration-related search terms
    IMMIGRATION_SEARCH_TERMS = [
        'immigration legal services',
        'immigrant rights',
        'refugee assistance',
        'citizenship help',
        'asylum services'
    ]

    def fetch_organizations(self, search_terms: List[str] = None, limit: int = 20) -> List[Dict]:
        """
        Fetch nonprofit organizations by searching for immigration-related terms

        Args:
            search_terms: List of search terms (default: immigration-related)
            limit: Maximum number of organizations to fetch

        Returns:
            List of organization dictionaries ready for database insertion
        """
        if search_terms is None:
            search_terms = self.IMMIGRATION_SEARCH_TERMS

        organizations = []
        seen_eins = set()  # Track to avoid duplicates

        for term in search_terms:
            try:
                # Use search endpoint instead of direct EIN lookup
                response = requests.get(
                    f"{self.BASE_URL}/search.json",
                    params={'q': term},
                    timeout=10
                )

                if response.status_code == 200:
                    data = response.json()
                    orgs = data.get('organizations', [])

                    for org_data in orgs[:5]:  # Top 5 results per search term
                        ein = org_data.get('ein')
                        if ein and ein not in seen_eins:
                            seen_eins.add(ein)
                            transformed_org = self._transform_organization_from_search(org_data)
                            if transformed_org:
                                organizations.append(transformed_org)
                                print(f"Fetched organization: {transformed_org['name']}")

                        if len(organizations) >= limit:
                            return organizations

                    time.sleep(1)  # Rate limiting

                else:
                    print(f"Error searching for '{term}': {response.status_code}")

            except Exception as e:
                print(f"Error searching for '{term}': {e}")
                continue

        return organizations[:limit]

    def _transform_organization_from_search(self, org_data: Dict) -> Optional[Dict]:
        """Transform ProPublica search result data to our database schema"""
        try:
            # Search results have a flatter structure
            name = org_data.get('name', 'Unknown Organization')
            city = org_data.get('city', 'Unknown')
            state = org_data.get('state', 'Unknown')
            ein = str(org_data.get('ein', ''))

            # Get NTEE code and map to topic (convert to string)
            ntee_code = str(org_data.get('ntee_code', 'Q'))
            topic = self._map_ntee_to_topic(ntee_code)

            # Get subsection (convert to string)
            subsection = str(org_data.get('subsection', '3'))
            size = self._map_subsection_to_size(subsection)

            # Estimate meeting frequency
            meeting_frequency = self._estimate_meeting_frequency(ntee_code)

            return {
                'name': name[:255] if isinstance(name, str) else str(name)[:255],
                'city': city[:100] if isinstance(city, str) else str(city)[:100],
                'state': state[:50] if isinstance(state, str) else str(state)[:50],
                'topic': topic[:100],
                'size': size[:50],
                'meeting_frequency': meeting_frequency,
                'description': f"{name} - {topic} organization in {city}, {state}",
                'address': '',
                'zipcode': '',
                'ein': ein[:20],
                'subsection_code': f"501(c)({subsection})",
                'ntee_code': ntee_code[:20],
                'external_url': f"https://projects.propublica.org/nonprofits/organizations/{ein}",
                'guidestar_url': f"https://www.guidestar.org/profile/{ein}",
                'image_url': None
            }

        except Exception as e:
            print(f"Error transforming organization from search: {e}")
            return None

    def _transform_organization(self, org_data: Dict) -> Optional[Dict]:
        """Transform ProPublica organization data to our database schema (legacy method)"""
        try:
            org = org_data.get('organization', {})

            # Map NTEE code to topic
            ntee_code = org.get('ntee_code', 'Unknown')
            topic = self._map_ntee_to_topic(ntee_code)

            # Map subsection to size
            subsection = org.get('subseccd', '3')
            size = self._map_subsection_to_size(subsection)

            # Get most recent filing for additional info
            filings = org_data.get('filings_with_data', [])
            latest_filing = filings[0] if filings else {}

            # Estimate meeting frequency based on organization type
            meeting_frequency = self._estimate_meeting_frequency(ntee_code)

            return {
                'name': org.get('name', 'Unknown Organization')[:255],
                'city': org.get('city', 'Unknown')[:100],
                'state': org.get('state', 'Unknown')[:50],
                'topic': topic[:100],
                'size': size[:50],
                'meeting_frequency': meeting_frequency,
                'description': f"{org.get('name', '')} - {topic} organization in {org.get('city', '')}, {org.get('state', '')}",
                'address': org.get('address', '')[:255],
                'zipcode': org.get('zipcode', '')[:20],
                'ein': org.get('ein', '')[:20],
                'subsection_code': f"501(c)({subsection})",
                'ntee_code': ntee_code[:20],
                'external_url': f"https://www.guidestar.org/profile/{org.get('ein', '')}",
                'guidestar_url': org.get('guidestar_url', ''),
                'image_url': None  # ProPublica doesn't provide images
            }

        except Exception as e:
            print(f"Error transforming organization: {e}")
            return None

    def _map_ntee_to_topic(self, ntee_code: str) -> str:
        """Map NTEE code to human-readable topic"""
        ntee_map = {
            'Q': 'International Affairs',
            'Q30': 'Immigration & Refugee Services',
            'Q33': 'Refugee Services',
            'P': 'Human Services',
            'R': 'Civil Rights',
            'R20': 'Civil Rights & Advocacy',
            'I': 'Crime & Legal Services',
            'I80': 'Legal Services',
            'S': 'Community Improvement',
            'W': 'Public Affairs'
        }

        # Try exact match first, then prefix
        if ntee_code in ntee_map:
            return ntee_map[ntee_code]

        prefix = ntee_code[0] if ntee_code else 'Unknown'
        return ntee_map.get(prefix, 'Community Services')

    def _map_subsection_to_size(self, subsection: str) -> str:
        """Map subsection code to organization size category"""
        # This is a simplified mapping - could be enhanced with revenue data
        return f"501(c)({subsection}) Nonprofit"

    def _estimate_meeting_frequency(self, ntee_code: str) -> str:
        """Estimate meeting frequency based on organization type"""
        # Immigration service orgs typically meet frequently
        service_codes = ['Q30', 'Q33', 'I80', 'P']

        for code in service_codes:
            if code in ntee_code:
                return 'Weekly'

        return 'Monthly'


class CourtListenerAPI:
    """
    CourtListener API Integration
    Fetches immigration-related legal resources and court cases

    API Documentation: https://www.courtlistener.com/help/api/rest-v4/
    Authentication: API token required
    Note: V4 API required for new users (V3 deprecated)
    """

    BASE_URL = "https://www.courtlistener.com/api/rest/v4"

    def __init__(self, api_token: Optional[str] = None):
        self.api_token = api_token or os.getenv('COURTLISTENER_API_TOKEN')
        self.headers = {}

        if self.api_token:
            self.headers['Authorization'] = f'Token {self.api_token}'

    def search_immigration_cases(self, query: str = 'immigration', limit: int = 50) -> List[Dict]:
        """
        Search for immigration-related legal cases

        Args:
            query: Search query
            limit: Maximum number of cases to fetch

        Returns:
            List of resource dictionaries ready for database insertion
        """
        search_queries = [
            'immigration deportation',
            'asylum refugee',
            'visa citizenship',
            'DACA',
            'immigration reform'
        ]

        all_resources = []

        for query in search_queries[:3]:  # Limit searches
            try:
                params = {
                    'q': query,
                    'type': 'o',  # Opinions
                    'order_by': 'dateFiled desc'
                }

                response = requests.get(
                    f"{self.BASE_URL}/search/",
                    headers=self.headers,
                    params=params,
                    timeout=10
                )

                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])

                    for result in results[:limit]:
                        transformed = self._transform_case(result)
                        if transformed:
                            all_resources.append(transformed)

                    print(f"Fetched {len(results)} cases for: {query}")
                    time.sleep(3)  # Increased rate limiting to avoid 403s
                elif response.status_code == 403:
                    print(f"Error fetching cases: {response.status_code} (Access Forbidden)")
                    print(f"  Response: {response.text[:200]}")
                    print(f"  Headers used: {self.headers}")
                    print(f"  Increasing wait time and retrying...")
                    time.sleep(5)
                else:
                    print(f"Error fetching cases: {response.status_code}")
                    print(f"  Response: {response.text[:200]}")

            except Exception as e:
                print(f"Error searching cases for '{query}': {e}")
                continue

        # Remove duplicates
        seen = set()
        unique_resources = []
        for resource in all_resources:
            resource_id = resource.get('courtlistener_id')
            if resource_id and resource_id not in seen:
                seen.add(resource_id)
                unique_resources.append(resource)

        return unique_resources[:limit]

    def _transform_case(self, case_data: Dict) -> Optional[Dict]:
        """Transform CourtListener case data to our database schema"""
        try:
            # Skip if no case name
            case_name = case_data.get('caseName') or case_data.get('case_name')
            if not case_name:
                print(f"  ! Skipping case - no case name found in: {list(case_data.keys())[:5]}")
                return None

            # Determine scope based on court
            court_name = case_data.get('court') or case_data.get('court_name') or 'Unknown Court'
            scope = self._determine_scope(str(court_name))

            # Extract date - handle multiple possible field names
            date_filed = case_data.get('dateFiled') or case_data.get('date_filed') or case_data.get('dateArgued')
            if date_filed:
                try:
                    date_obj = datetime.fromisoformat(str(date_filed).replace('Z', '+00:00')).date()
                except:
                    date_obj = datetime.now().date()
            else:
                date_obj = datetime.now().date()

            # Get snippet/description - V4 uses 'opinions' array with 'snippet' inside
            description = case_name  # Default to case name
            if case_data.get('opinions') and len(case_data['opinions']) > 0:
                description = case_data['opinions'][0].get('snippet', case_name)

            # Get URL
            abs_url = case_data.get('absolute_url') or ''
            external_url = f"https://www.courtlistener.com{abs_url}" if abs_url else ''

            # Handle citation - V4 returns array, join with commas
            citation_raw = case_data.get('citation', [])
            citation = ', '.join(citation_raw) if isinstance(citation_raw, list) else str(citation_raw)

            return {
                'title': str(case_name)[:500],
                'date_published': date_obj,
                'topic': self._extract_topic(str(case_name)),
                'scope': scope,
                'description': str(description)[:1000],
                'format': 'Court Opinion',
                'court_name': str(court_name)[:255],
                'citation': citation[:255],
                'external_url': external_url,
                'image_url': None,
                'courtlistener_id': str(case_data.get('cluster_id') or case_data.get('id') or ''),
                'docket_number': str(case_data.get('docketNumber') or case_data.get('docket_number') or '')[:100],
                'judge_name': str(case_data.get('judge') or '')[:255]
            }

        except Exception as e:
            print(f"Error transforming case: {e}")
            return None

    def _determine_scope(self, court_name: str) -> str:
        """Determine if case is Federal, State, or Local"""
        court_lower = court_name.lower()

        if any(term in court_lower for term in ['supreme court', 'circuit', 'district court', 'u.s.', 'united states']):
            return 'Federal'
        elif any(term in court_lower for term in ['state', 'appellate', 'superior']):
            return 'State'
        else:
            return 'Local'

    def _extract_topic(self, case_name: str) -> str:
        """Extract topic from case name"""
        case_lower = case_name.lower()

        topics = {
            'deportation': 'Deportation',
            'removal': 'Deportation',
            'asylum': 'Asylum',
            'refugee': 'Refugee Status',
            'visa': 'Visa',
            'citizenship': 'Citizenship',
            'naturalization': 'Naturalization',
            'daca': 'DACA',
            'green card': 'Permanent Residency',
            'detention': 'Immigration Detention'
        }

        for keyword, topic in topics.items():
            if keyword in case_lower:
                return topic

        return 'Immigration Law'


# Convenience function to test APIs without database
def test_apis():
    """Test API integrations independently"""
    print("Testing API Integrations...\n")

    # Test ProPublica (no auth required)
    print("=" * 50)
    print("Testing ProPublica Nonprofit Explorer API")
    print("=" * 50)
    try:
        propublica = ProPublicaNonprofitAPI()
        orgs = propublica.fetch_organizations(limit=3)
        print(f"\nFetched {len(orgs)} organizations")
        if orgs:
            print(f"Sample: {orgs[0]['name']} - {orgs[0]['city']}, {orgs[0]['state']}")
    except Exception as e:
        print(f"Error: {e}")

    # Test CourtListener (optional auth)
    print("\n" + "=" * 50)
    print("Testing CourtListener API")
    print("=" * 50)
    try:
        court = CourtListenerAPI()
        resources = court.search_immigration_cases(limit=3)
        print(f"\nFetched {len(resources)} legal resources")
        if resources:
            print(f"Sample: {resources[0]['title'][:100]}...")
    except Exception as e:
        print(f"Error: {e}")

    # Test Eventbrite (requires auth)
    print("\n" + "=" * 50)
    print("Testing Eventbrite API (requires API token)")
    print("=" * 50)
    try:
        eventbrite = EventbriteAPI()
        events = eventbrite.search_events(limit=3)
        print(f"\nFetched {len(events)} events")
        if events:
            print(f"Sample: {events[0]['title']} - {events[0]['location']}")
    except Exception as e:
        print(f"Error: {e}")
        print("Tip: Set EVENTBRITE_API_TOKEN environment variable")


if __name__ == "__main__":
    test_apis()
