# Spec Delta

## Purpose

Build and publish the filament selector reliably at its existing GitHub Pages address, with reproducible artifacts and build feedback before changes reach production.

## ADDED Requirements

### Requirement: Reproducible production build

The project SHALL provide a documented build command that performs TypeScript checking and emits a deployable static site from dependencies installed using the committed lockfile and declared toolchain.

#### Scenario: Clean checkout builds successfully

- **WHEN** a contributor installs the locked dependencies in a clean checkout using the documented toolchain and runs the production build command
- **THEN** TypeScript checking succeeds and a static site artifact is produced
- **AND** the artifact contains all locally hosted scripts, styles, and images needed by the application

#### Scenario: Type errors block production output from publishing

- **WHEN** TypeScript checking fails during the production build
- **THEN** the build reports failure and publishing does not run

### Requirement: Pull-request build feedback

GitHub Actions SHALL run the production build for pull requests targeting `main` and report the result without deploying the pull request to the public site.

#### Scenario: Pull request passes build

- **WHEN** a pull request targeting `main` is opened or updated and its build succeeds
- **THEN** GitHub reports a successful build check
- **AND** the public deployment is unchanged

#### Scenario: Pull request fails build

- **WHEN** a pull request targeting `main` contains a compilation or build error
- **THEN** GitHub reports a failed build check
- **AND** the public deployment is unchanged

### Requirement: Publish the main branch

GitHub Actions SHALL build pushes to `main` and publish the resulting successful artifact to GitHub Pages. An authorized manual workflow run on `main` SHALL support republishing. Deployment SHALL require a successful build of the same revision.

#### Scenario: Main branch deployment succeeds

- **WHEN** a push to `main` builds successfully
- **THEN** that revision's production artifact is published through the GitHub Pages deployment environment
- **AND** the workflow exposes the deployment URL

#### Scenario: Build failure preserves the deployed version

- **WHEN** a push to `main` fails dependency installation, type checking, or bundling
- **THEN** no deployment of that revision runs
- **AND** the last successful deployment remains available

#### Scenario: Manual deployment uses main

- **WHEN** an authorized maintainer manually runs the publishing workflow on `main`
- **THEN** the workflow builds that revision and publishes only after the build succeeds

#### Scenario: Another branch cannot publish

- **WHEN** the workflow runs for a pull request or a manual invocation on a branch other than `main`
- **THEN** it does not deploy to the production GitHub Pages environment

### Requirement: Preserve the project address and asset resolution

The published site SHALL remain available at `https://solvo-herramientas.github.io/selector-filamentos/`. Application assets SHALL resolve under that project path, and the `#curador` entry point SHALL remain usable there.

#### Scenario: Load the published application

- **WHEN** a visitor opens the existing project URL
- **THEN** the application loads its scripts, styles, and logo successfully from the deployed site
- **AND** the existing canonical URL and social metadata are retained

#### Scenario: Open curator mode directly

- **WHEN** a visitor opens `https://solvo-herramientas.github.io/selector-filamentos/#curador`
- **THEN** the application enables curator access using its existing behavior
- **AND** the fragment does not alter asset resolution
