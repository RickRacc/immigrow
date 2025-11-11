from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# Association table for many-to-many relationship between Events and Resources
event_resources = db.Table('event_resources',
    db.Column('event_id', db.Integer, db.ForeignKey('event.id'), primary_key=True),
    db.Column('resource_id', db.Integer, db.ForeignKey('resource.id'), primary_key=True)
)

# Association table for many-to-many relationship between Organizations and Resources
organization_resources = db.Table('organization_resources',
    db.Column('organization_id', db.Integer, db.ForeignKey('organization.id'), primary_key=True),
    db.Column('resource_id', db.Integer, db.ForeignKey('resource.id'), primary_key=True)
)


class Event(db.Model):
    """
    Events Model - Immigration-related community events
    Data Source: Eventbrite API

    Required Attributes (5+):
    1. Location (city, state)
    2. Title (name)
    3. Date (date)
    4. Start Time (start_time)
    5. Length of Event (duration_minutes)
    """
    __tablename__ = 'event'

    id = db.Column(db.Integer, primary_key=True)

    # Core attributes (5 required)
    title = db.Column(db.String(255), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, index=True)
    start_time = db.Column(db.String(50), nullable=False)  # e.g., "7:00 PM EST"
    duration_minutes = db.Column(db.Integer, nullable=False)  # Length of event
    location = db.Column(db.String(255), nullable=False, index=True)  # "City, State"

    # Additional attributes
    city = db.Column(db.String(100))
    state = db.Column(db.String(50))
    venue_name = db.Column(db.String(255))
    description = db.Column(db.Text)
    external_url = db.Column(db.String(500))  # Link to event page
    image_url = db.Column(db.String(500))
    eventbrite_id = db.Column(db.String(100), unique=True)  # Original API ID
    end_time = db.Column(db.String(50))
    timezone = db.Column(db.String(50))

    # Foreign key to Organization
    organization_id = db.Column(db.Integer, db.ForeignKey('organization.id'), index=True)

    # Relationships
    organization = db.relationship('Organization', back_populates='events')
    resources = db.relationship('Resource', secondary=event_resources, back_populates='events')

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, include_relationships=False):
        """Convert event to dictionary for JSON serialization"""
        data = {
            'id': self.id,
            'title': self.title,
            'date': self.date.isoformat() if self.date else None,
            'start_time': self.start_time,
            'duration_minutes': self.duration_minutes,
            'location': self.location,
            'city': self.city,
            'state': self.state,
            'venue_name': self.venue_name,
            'description': self.description,
            'external_url': self.external_url,
            'image_url': self.image_url,
            'end_time': self.end_time,
            'timezone': self.timezone,
            'organization_id': self.organization_id
        }

        if include_relationships:
            data['organization'] = self.organization.to_dict() if self.organization else None
            data['resources'] = [r.to_dict() for r in self.resources]

        return data

    def __repr__(self):
        return f'<Event {self.id}: {self.title}>'


class Organization(db.Model):
    """
    Organizations Model - Nonprofit organizations supporting immigrants
    Data Source: ProPublica Nonprofit Explorer API

    Required Attributes (5+):
    1. Location (city, state)
    2. Size (classification/subsection code)
    3. Topic (ntee_code - National Taxonomy)
    4. Meeting Frequency (estimated based on type)
    5. Description (from name and classification)
    """
    __tablename__ = 'organization'

    id = db.Column(db.Integer, primary_key=True)

    # Core attributes (5 required)
    name = db.Column(db.String(255), nullable=False, index=True)
    city = db.Column(db.String(100), nullable=False, index=True)
    state = db.Column(db.String(50), nullable=False, index=True)
    topic = db.Column(db.String(100), nullable=False, index=True)  # From NTEE code
    size = db.Column(db.String(50), nullable=False)  # Based on subsection/classification

    # Additional attributes
    meeting_frequency = db.Column(db.String(50))  # "Weekly", "Monthly", "Quarterly", etc.
    description = db.Column(db.Text)
    address = db.Column(db.String(255))
    zipcode = db.Column(db.String(20))
    ein = db.Column(db.String(20), unique=True)  # Employer ID Number
    subsection_code = db.Column(db.String(20))  # 501(c)(3), etc.
    ntee_code = db.Column(db.String(20))  # National Taxonomy of Exempt Entities
    external_url = db.Column(db.String(500))  # Organization website
    image_url = db.Column(db.String(500))
    guidestar_url = db.Column(db.String(500))
    form_990_pdf_url = db.Column(db.String(500))  # IRS Form 990 PDF (Media #2)

    # Relationships
    events = db.relationship('Event', back_populates='organization', cascade='all, delete-orphan')
    resources = db.relationship('Resource', secondary=organization_resources, back_populates='organizations')

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, include_relationships=False):
        """Convert organization to dictionary for JSON serialization"""
        data = {
            'id': self.id,
            'name': self.name,
            'city': self.city,
            'state': self.state,
            'topic': self.topic,
            'size': self.size,
            'meeting_frequency': self.meeting_frequency,
            'description': self.description,
            'address': self.address,
            'zipcode': self.zipcode,
            'ein': self.ein,
            'subsection_code': self.subsection_code,
            'ntee_code': self.ntee_code,
            'external_url': self.external_url,
            'image_url': self.image_url,
            'guidestar_url': self.guidestar_url,
            'form_990_pdf_url': self.form_990_pdf_url
        }

        if include_relationships:
            data['events'] = [e.to_dict() for e in self.events]
            data['resources'] = [r.to_dict() for r in self.resources]

        return data

    def __repr__(self):
        return f'<Organization {self.id}: {self.name}>'


class Resource(db.Model):
    """
    Legal Resources Model - Legal information, court cases, and immigration resources
    Data Source: CourtListener API (immigration-related cases and resources)

    Required Attributes (5+):
    1. Date (date_filed or date_published)
    2. Topic (subject matter)
    3. Scope (Federal/State/Local)
    4. Description (case_name or summary)
    5. Date (published date)
    """
    __tablename__ = 'resource'

    id = db.Column(db.Integer, primary_key=True)

    # Core attributes (5 required)
    title = db.Column(db.String(500), nullable=False, index=True)  # Case name or resource title
    date_published = db.Column(db.Date, nullable=False, index=True)
    topic = db.Column(db.String(100), nullable=False, index=True)  # Immigration law topic
    scope = db.Column(db.String(50), nullable=False, index=True)  # Federal/State/Local
    description = db.Column(db.Text, nullable=False)

    # Additional attributes
    format = db.Column(db.String(50))  # "PDF", "HTML", "Court Opinion", etc.
    court_name = db.Column(db.String(255))  # For legal cases
    citation = db.Column(db.String(255))  # Legal citation
    external_url = db.Column(db.String(500))  # Link to resource
    image_url = db.Column(db.String(500))
    audio_url = db.Column(db.String(500))  # Oral argument audio or PDF (Media #2)
    courtlistener_id = db.Column(db.String(100), unique=True)  # Original API ID
    docket_number = db.Column(db.String(100))
    judge_name = db.Column(db.String(255))

    # Relationships
    organizations = db.relationship('Organization', secondary=organization_resources, back_populates='resources')
    events = db.relationship('Event', secondary=event_resources, back_populates='resources')

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, include_relationships=False):
        """Convert resource to dictionary for JSON serialization"""
        data = {
            'id': self.id,
            'title': self.title,
            'date_published': self.date_published.isoformat() if self.date_published else None,
            'topic': self.topic,
            'scope': self.scope,
            'description': self.description,
            'format': self.format,
            'court_name': self.court_name,
            'citation': self.citation,
            'external_url': self.external_url,
            'image_url': self.image_url,
            'audio_url': self.audio_url,
            'docket_number': self.docket_number,
            'judge_name': self.judge_name
        }

        if include_relationships:
            data['organizations'] = [o.to_dict() for o in self.organizations]
            data['events'] = [e.to_dict() for e in self.events]

        return data

    def __repr__(self):
        return f'<Resource {self.id}: {self.title}>'
