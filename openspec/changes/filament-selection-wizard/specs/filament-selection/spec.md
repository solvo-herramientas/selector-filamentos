# Spec Delta

## Purpose

Guide users through the conditions of a printed piece in seven fixed wizard steps and present material recommendations after those steps are complete, with accessible navigation on mobile and desktop.

## ADDED Requirements

### Requirement: Explicit beginning and suggested answers
The selector SHALL begin with an unanswered piece-type question and no visible recommendation. Choosing a piece type SHALL populate editable suggestions from its preset without automatically advancing or treating later questions as completed.

#### Scenario: First visit
- **WHEN** a user opens Elegir filamento in a fresh session
- **THEN** no piece type is selected and Continuar is unavailable until a type is chosen
- **AND** no example recommendation or results shortcut is displayed

#### Scenario: Preset suggestions
- **WHEN** a user chooses a piece type and selects Continuar
- **THEN** step two shows the preset suggestions, which the user can accept or change
- **AND** each remaining step requires explicit continuation

### Requirement: Seven fixed wizard steps
The selector SHALL display exactly seven fixed steps in this order: piece type; temperatures and heat; outdoor exposure; liquids and chemicals; mechanical stress; special requirements; manufacturing and equipment. Each step SHALL keep its related questions together on one screen. Selecting an answer SHALL NOT advance the wizard.

#### Scenario: Grouped temperature conditions
- **WHEN** a user opens the temperature step
- **THEN** working temperature, additional heat, occasional peak, and minimum temperature appear together
- **AND** color appears in that step when direct solar heat is selected
- **AND** the current step remains visible until Continuar is activated

### Requirement: Conditional details within each step
The wizard SHALL show relevant follow-up fields inside their existing step: color for direct solar heat; sun, humidity, and abrasion for outdoor exposure; chemical contact levels for liquid contact; load and friction for mechanical stress; and equipment capabilities for self-printing. No sé SHALL retain existing conservative assumptions without requiring those details.

#### Scenario: Skip irrelevant branches
- **WHEN** a user answers No to outdoor exposure, liquid contact, and mechanical stress and chooses La encargo
- **THEN** the outdoor, chemical, load/friction, and equipment details stay hidden within their steps
- **AND** rigidity, special requirements, and selection priority remain applicable

#### Scenario: Chemical contact
- **WHEN** a user answers Sí to liquid contact
- **THEN** the liquid step shows every substance with no-contact, splash, and immersion choices
- **AND** at least one substance must have splash or immersion selected before continuing
- **AND** these choices do not add wizard steps

#### Scenario: Unknown conditions
- **WHEN** a user chooses No sé for outdoor exposure, liquid contact, mechanical stress, or working temperature
- **THEN** the final recommendation uses and explains the corresponding existing conservative assumptions

### Requirement: Reversible navigation and progress
Wizard screens SHALL provide Atrás and Continuar, with Atrás unavailable on the first step and Ver resultados replacing Continuar on step seven. Navigation SHALL preserve answers and show the current position out of seven. Switching app tabs SHALL preserve wizard progress for the current page session.

#### Scenario: Backtracking
- **WHEN** a user goes backward and then forward without changing an answer
- **THEN** the previous answers remain selected and the same seven steps are visited

#### Scenario: Changing a conditional answer
- **WHEN** a user changes outdoor exposure from Sí to No
- **THEN** the outdoor follow-up fields disappear while the wizard remains on the same step
- **AND** retained outdoor details do not affect the final recommendation

#### Scenario: Returning from another tab
- **WHEN** a user visits Explorar materiales and returns to Elegir filamento
- **THEN** the same wizard step or results view and answers are restored
- **AND** no wizard action footer overlays the other tab

### Requirement: Valid answers before completion
The wizard SHALL prevent continuation with a missing required choice, a blank or non-finite required number, an out-of-scope working temperature, a minimum above the effective working temperature, or affirmative liquid contact without at least one chemical set to splash or immersion. Errors SHALL be explained beside the active step. Existing peak-temperature clamping SHALL remain an explained warning rather than a blocking error.

#### Scenario: Invalid numeric answer
- **WHEN** a user clears a required temperature field or enters a working temperature outside −40 to 200 °C
- **THEN** continuation is prevented and the temperature step explains how to correct the answer

#### Scenario: Peak below working temperature
- **WHEN** the occasional peak is below the effective working temperature
- **THEN** the wizard explains that the working temperature will be used as the peak and allows continuation

### Requirement: Recommendations after completion
The selector SHALL reveal results only after step seven is submitted successfully. Results SHALL retain ranking, qualifying and near-miss materials, exclusions, conservative assumptions, manufacturing advice, comparison, quotation sharing/copying, and printing. Equivalent completed answers and material data SHALL produce the existing recommendation outcomes.

#### Scenario: Complete a selection
- **WHEN** a user activates Ver resultados after completing all seven steps
- **THEN** the recommendation screen is shown with the final conditions and existing result tools
- **AND** no unfinished step remains beside it

#### Scenario: No qualifying materials
- **WHEN** no material satisfies the completed conditions
- **THEN** results explain that outcome and retain near-miss and limiting-condition information where available

### Requirement: Edit and restart from results
The results screen SHALL offer Editar respuestas and Empezar de nuevo. Editing SHALL retain answers and return to step one, hiding results until completion again. Restarting SHALL clear wizard completion, answers, and result comparison selection and return to the unanswered piece-type step. Neither action SHALL reset curated material data.

#### Scenario: Edit a completed selection
- **WHEN** a user selects Editar respuestas
- **THEN** step one opens with the existing piece type selected
- **AND** unchanged choices remain available throughout the route

#### Scenario: Start another selection
- **WHEN** a user selects Empezar de nuevo
- **THEN** step one has no selected piece type and previous recommendations and comparisons are cleared

### Requirement: Fixed mobile action footer
Every wizard screen, including the first step and results, SHALL provide an action footer fixed to the bottom of the mobile visible viewport. The footer SHALL respect device safe areas, remain reachable with the software keyboard open, and reserve enough content clearance to avoid covering inputs, errors, or the last result. Desktop navigation SHALL remain associated with the wizard content.

#### Scenario: Mobile step navigation
- **WHEN** a user scrolls a long step on a mobile viewport
- **THEN** Atrás and Continuar or Ver resultados remain available at the bottom
- **AND** all content can be scrolled above the footer

#### Scenario: Software keyboard
- **WHEN** a user focuses a numeric field and the mobile keyboard opens
- **THEN** the field and its validation can be brought into view and footer actions remain reachable above the keyboard

#### Scenario: Mobile results and printing
- **WHEN** a user reaches results on mobile
- **THEN** the fixed footer offers Editar respuestas and Empezar de nuevo
- **AND** printing the report excludes the wizard navigation footer

### Requirement: Accessible and interruptible transitions
Pointer-driven step navigation SHALL use a brief directional slide and fade that reverses for backward navigation, while the action footer remains stationary. Transitions SHALL finish within 300ms, tolerate rapid reversal without stale content or duplicate advancement, and provide a gentler fade without translation for reduced motion. Keyboard-driven navigation SHALL change screens instantly.

#### Scenario: Direction and interruption
- **WHEN** a user continues forward and quickly navigates backward during a transition
- **THEN** the current intended step wins without blank screens or duplicated navigation
- **AND** the footer remains stationary

#### Scenario: Reduced motion and keyboard
- **WHEN** reduced motion is requested
- **THEN** pointer-driven screen changes use a gentle fade without positional motion
- **WHEN** a screen change is activated with a keyboard
- **THEN** the change is instant

### Requirement: Accessible step changes
The active step SHALL have a meaningful heading, labelled controls, and accessible progress out of seven. After navigation, focus SHALL move to the new step heading or results heading; outgoing content SHALL be excluded from focus and assistive technology. Validation SHALL be associated with its field and announced when it prevents continuation.

#### Scenario: Navigate with assistive technology
- **WHEN** a user advances to another step
- **THEN** the new heading and current progress are available to assistive technology
- **AND** tab navigation cannot reach controls from the previous step
