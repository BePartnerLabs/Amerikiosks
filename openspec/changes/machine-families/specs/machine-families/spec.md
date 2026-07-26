## ADDED Requirements

### Requirement: Machine family content model
The system SHALL provide a `machine-families` collection representing a product series (e.g. Alpha, Gamma, Delta) with editable marketing content, independent of any specific `machines` model.

#### Scenario: Family document holds series-level marketing content
- **WHEN** an editor creates a `machine-families` document
- **THEN** the system SHALL require `name`, `slug`, and `thumbnail`, and SHALL allow `tagline`, `description`, `ctaLabel`, and a `highlights` group (`eyebrow`, `heading`, and an `items` array of `icon`/`image` + `title` + `description`)

#### Scenario: Family slug is not localized
- **WHEN** an editor switches the admin locale selector between `en` and `es` on a `machine-families` document
- **THEN** the `slug` value SHALL stay the same across both locales, while `name`, `tagline`, `description`, `ctaLabel`, and `highlights` text fields SHALL hold independent per-locale values

### Requirement: Machine belongs to exactly one family
Every `machines` document SHALL be linked to exactly one `machine-families` document via a required relationship field.

#### Scenario: Model cannot be saved without a family
- **WHEN** an editor attempts to save a `machines` document with no `family` selected
- **THEN** the system SHALL reject the save with a validation error

#### Scenario: Existing machines pending migration
- **WHEN** the `family` field is added to the `machines` collection
- **THEN** all pre-existing `machines` documents SHALL be treated as invalid until an editor assigns a `family` to each one (no automatic inference from the machine name)

### Requirement: Home model-lines block
The system SHALL provide a `ModelLines` layout-builder block, placeable on any `Pages` document (including Home), that lists all `machine-families` as clickable cards.

#### Scenario: Block lists all families sorted by name
- **WHEN** the `ModelLines` block renders
- **THEN** it SHALL fetch all `machine-families` documents and render one card per family showing its `thumbnail` and `name`

#### Scenario: Clicking a family card navigates to the family page
- **WHEN** a visitor clicks a family card in the `ModelLines` block
- **THEN** the browser SHALL navigate directly to `/machines/[family.slug]` (not to the `/machines` landing page)

### Requirement: /machines landing page
The system SHALL provide a fixed route at `/machines` that presents each family as a narrative marketing section, distinct from any Payload layout-builder page.

#### Scenario: Landing lists every family as a section
- **WHEN** a visitor loads `/machines`
- **THEN** the page SHALL render a top row of all family thumbnails and, below it, one section per `machine-families` document showing its `tagline`, `description`, and the 4 `highlights.items` cards

#### Scenario: Section CTA links to the family page
- **WHEN** a visitor clicks the `ctaLabel` button ("Know more") within a family's section on `/machines`
- **THEN** the browser SHALL navigate to `/machines/[family.slug]`

#### Scenario: Landing page structure is not editable via layout-builder
- **WHEN** an editor looks for `/machines` in the `Pages` collection admin list
- **THEN** it SHALL NOT appear there — the route and its section order are fixed in code, only the underlying `machine-families` content is editable

### Requirement: /machines/[family] product-line page
The system SHALL provide a fixed route at `/machines/[family]` that combines the family's narrative content with a listing of its real models, following the same fixed-route pattern as `/machines/[slug]`.

#### Scenario: Page 404s for an unknown family slug
- **WHEN** a visitor requests `/machines/does-not-exist`
- **THEN** the system SHALL respond with a not-found page

#### Scenario: Page shows family narrative, all families nav, and real models
- **WHEN** a visitor loads `/machines/[family]` for an existing family
- **THEN** the page SHALL render a row linking to every family (current one highlighted), the current family's `tagline`/`description`/`highlights.items`, and a grid of every `machines` document whose `family` equals the current family

#### Scenario: Model card links to the model detail page
- **WHEN** a visitor clicks a model card within `/machines/[family]`
- **THEN** the browser SHALL navigate to `/machines/[machine.slug]`

### Requirement: Related-machines section shows sibling families
The "Find the right kiosk for your space" section on a model's detail page (`machines/[slug]`) SHALL show other product families, not other individual models.

#### Scenario: Sibling families exclude the current model's family
- **WHEN** a visitor views `machines/[slug]` for a model in family "Gamma"
- **THEN** the related section SHALL list `machine-families` documents other than "Gamma", each linking to `/machines/[family.slug]`

#### Scenario: "View all models" links to the machines landing
- **WHEN** a visitor clicks "View all models" in the related-families section
- **THEN** the browser SHALL navigate to `/machines`

### Requirement: Reserved slugs on Pages
The `pages` collection SHALL reject slugs that collide with fixed frontend routes defined in code.

#### Scenario: Editor cannot save a Page with a reserved slug
- **WHEN** an editor attempts to save a `pages` document with `slug` equal to `machines`, `insights`, `faq`, `customer-service`, `projects`, or `search`
- **THEN** the system SHALL reject the save with a validation error identifying the conflicting reserved slug
