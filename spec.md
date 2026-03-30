# D.Y.P.InnoHub

## Current State
Backend stores user profiles, projects, and comments in non-stable Motoko Maps. These are wiped on every canister upgrade (every new deployment), causing profile names and all data to disappear.

## Requested Changes (Diff)

### Add
- Stable variables (`stableNextProjectId`, `stableNextCommentId`, `stableProjects`, `stableComments`, `stableUserProfiles`) to persist data across upgrades
- `system func preupgrade()` to serialize all maps to stable arrays before upgrade
- `do` block to restore maps from stable storage on canister initialization

### Modify
- Data declarations to initialize from stable storage on startup

### Remove
- Nothing removed

## Implementation Plan
1. Add stable array variables for all data
2. Add `do` initialization block to restore data from stable arrays into working maps
3. Add `preupgrade` system function to serialize maps before upgrade
