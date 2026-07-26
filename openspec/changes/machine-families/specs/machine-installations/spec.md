## ADDED Requirements

### Requirement: Machine installation content model
The system SHALL provide a `machine-installations` collection representing real-world photos of a specific `machines` model deployed at a client site, without requiring an editorial case-study body.

#### Scenario: Installation links a client, a machine, and photos
- **WHEN** an editor creates a `machine-installations` document
- **THEN** the system SHALL require `client` (relationship to `partners`), `machine` (relationship to `machines`), and at least one entry in `photos` (an array of required image uploads); `location` SHALL be optional

#### Scenario: Installation reuses the existing partner record
- **WHEN** an editor selects a `client` for a `machine-installations` document
- **THEN** the displayed name and logo SHALL come from the linked `partners` document (`partners.name`, `partners.logo`), not from duplicated fields on the installation

### Requirement: Installations gallery on the family page
The `/machines/[family]` page SHALL show a gallery of real client installations for that family, derived transitively through each installation's linked machine.

#### Scenario: Gallery includes installations across all models in the family
- **WHEN** a visitor loads `/machines/[family]` for family "Gamma"
- **THEN** the page SHALL query `machine-installations` where the linked `machine.family` equals "Gamma" and render each result's client logo/name and photos

#### Scenario: Section is hidden when there are no installations for the family
- **WHEN** a visitor loads `/machines/[family]` for a family with zero linked `machine-installations`
- **THEN** the page SHALL NOT render the installations section at all (no empty state, no placeholder)
