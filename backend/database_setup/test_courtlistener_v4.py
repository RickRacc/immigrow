"""
Test CourtListener V4 API to see the response format
Useful for debugging API changes and verifying authentication
"""

import os
import requests
from dotenv import load_dotenv
import json

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

api_token = os.getenv('COURTLISTENER_API_TOKEN')

headers = {
    'Authorization': f'Token {api_token}'
}

params = {
    'q': 'immigration deportation',
    'type': 'o',  # Opinions
    'order_by': 'dateFiled desc'
}

print("Testing CourtListener V4 API...")
print(f"URL: https://www.courtlistener.com/api/rest/v4/search/")
print(f"Params: {params}")
print()

response = requests.get(
    "https://www.courtlistener.com/api/rest/v4/search/",
    headers=headers,
    params=params,
    timeout=10
)

print(f"Status Code: {response.status_code}")
print()

if response.status_code == 200:
    data = response.json()
    print(f"Response keys: {data.keys()}")
    print(f"Number of results: {len(data.get('results', []))}")
    print()

    if data.get('results'):
        print("First result structure:")
        first_result = data['results'][0]
        print(json.dumps(first_result, indent=2))
else:
    print(f"Error: {response.text}")
