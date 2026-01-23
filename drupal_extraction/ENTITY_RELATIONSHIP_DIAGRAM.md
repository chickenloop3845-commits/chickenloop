# Chickenloop.com Data Structure Diagrams

## Overview Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ NODE : "authors"
    USER ||--|| PROFILE_RESUME : "has"
    USER ||--o{ COMMENT : "writes"
    USER ||--o{ FLAGGING : "creates"
    USER ||--o{ FILE : "uploads"

    NODE ||--o{ COMMENT : "has"
    NODE ||--o| NODE_REVISION : "versioned_as"
    NODE }o--|| NODE_TYPE : "is_type"
    NODE ||--o{ FLAGGING : "flagged_by"

    PROFILE_RESUME ||--|| FIELD_COLLECTION_PERSONAL_INFO : "contains"
    PROFILE_RESUME ||--|| FIELD_COLLECTION_JOB_PREFS : "contains"
    PROFILE_RESUME ||--o{ FIELD_COLLECTION_EXPERIENCE : "contains"
    PROFILE_RESUME ||--o{ FIELD_COLLECTION_LANGUAGES : "contains"
    PROFILE_RESUME ||--o{ FIELD_COLLECTION_SKILLS : "contains"
    PROFILE_RESUME ||--o{ FIELD_COLLECTION_ATTACHMENTS : "contains"

    NODE ||--o{ JOB_FIELDS : "has_when_job_type"
    JOB_FIELDS }o--o{ TAXONOMY_TERM : "references"

    NODE ||--o{ ARTICLE_FIELDS : "has_when_article"
    ARTICLE_FIELDS }o--|| FILE : "references_image"

    NODE ||--o{ KITESURF_FIELDS : "has_when_kitesurf"

    TAXONOMY_TERM }o--|| TAXONOMY_VOCABULARY : "belongs_to"
    TAXONOMY_TERM }o--o| TAXONOMY_TERM : "has_parent"

    FILE ||--o{ FILE_USAGE : "used_in"

    TRACKED_EVENT }o--|| NODE : "tracks"
    TRACKED_EVENT }o--|| USER : "by_user"

    FIELD_COLLECTION_PERSONAL_INFO }o--|| PROFILE_RESUME : "part_of"
    FIELD_COLLECTION_JOB_PREFS }o--|| PROFILE_RESUME : "part_of"
    FIELD_COLLECTION_EXPERIENCE }o--|| PROFILE_RESUME : "part_of"
    FIELD_COLLECTION_LANGUAGES }o--|| PROFILE_RESUME : "part_of"
    FIELD_COLLECTION_LANGUAGES }o--|| TAXONOMY_TERM : "language_ref"
    FIELD_COLLECTION_SKILLS }o--|| PROFILE_RESUME : "part_of"
    FIELD_COLLECTION_SKILLS }o--|| TAXONOMY_TERM : "skill_ref"

    NODE_JOB_APPLICATION }o--|| NODE_JOB : "applies_to"

    USER {
        int uid PK
        string name UK
        string mail UK
        int created
        int status
        string language
        string uuid UK
    }

    NODE {
        int nid PK
        int vid FK
        string type FK
        string title
        int uid FK
        int status
        int created
        int changed
        string language
        string uuid UK
    }

    NODE_REVISION {
        int vid PK
        int nid FK
        int uid FK
        string title
        string log
        int timestamp
    }

    PROFILE_RESUME {
        int pid PK
        int uid FK,UK
        string label
        string field_resume_state
    }

    TAXONOMY_TERM {
        int tid PK
        int vid FK
        string name
        text description
        int weight
        string vocabulary_machine_name
        string uuid UK
    }

    TAXONOMY_VOCABULARY {
        int vid PK
        string machine_name UK
        string name
        text description
        int hierarchy
    }

    COMMENT {
        int cid PK
        int nid FK
        int uid FK
        string subject
        int created
        int changed
        int status
        string language
    }

    FILE {
        int fid PK
        int uid FK
        string filename
        string uri UK
        string filemime
        int filesize
        int status
        int timestamp
    }

    FLAGGING {
        int flagging_id PK
        string entity_type
        int entity_id
        int uid FK
        string flag_name
        int timestamp
    }

    TRACKED_EVENT {
        int id PK
        string type
        int entity_id FK
        int uid FK
        int timestamp
    }
```

## Job Posting Data Structure

```mermaid
erDiagram
    NODE_JOB ||--|| JOB_CORE_FIELDS : "has"
    NODE_JOB ||--|| JOB_SINGLE_REFS : "has"
    NODE_JOB ||--o{ JOB_EMPLOYMENT_TYPE : "has_many"
    NODE_JOB ||--o{ JOB_LANGUAGES : "has_many"
    NODE_JOB ||--o{ JOB_OCCUPATIONAL_FIELDS : "has_many"
    NODE_JOB ||--o{ JOB_SKILLS_GENERAL : "has_many"
    NODE_JOB ||--o{ JOB_SKILLS_IT : "has_many"
    NODE_JOB ||--o{ JOB_QUALIFICATIONS : "has_many"
    NODE_JOB ||--o{ JOB_ACTIVITIES : "has_many"

    JOB_EMPLOYMENT_TYPE }o--|| TAXONOMY_TERM_EMPLOYMENT : "references"
    JOB_LANGUAGES }o--|| TAXONOMY_TERM_LANGUAGE : "references"
    JOB_OCCUPATIONAL_FIELDS }o--|| TAXONOMY_TERM_OCCUPATION : "references"
    JOB_SKILLS_GENERAL }o--|| TAXONOMY_TERM_SKILL : "references"
    JOB_SKILLS_IT }o--|| TAXONOMY_TERM_IT_SKILL : "references"
    JOB_QUALIFICATIONS }o--|| TAXONOMY_TERM_QUALIFICATION : "references"
    JOB_ACTIVITIES }o--|| TAXONOMY_TERM_ACTIVITY : "references"

    JOB_SINGLE_REFS }o--|| TAXONOMY_TERM_EXPERIENCE : "field_job_experience_term"
    JOB_SINGLE_REFS }o--|| TAXONOMY_TERM_GEOGRAPHY : "field_job_region"

    NODE_JOB {
        int nid PK
        string type "job_per_template|job_per_link|job_per_file"
    }

    JOB_CORE_FIELDS {
        int nid PK,FK
        text body_value
        text body_summary
        string body_format
        string field_job_email
        string field_job_location
        string field_job_organization
        decimal field_job_salary
        string field_job_workflow_state
        string field_job_application_workflow
        int field_listing_count
        string field_website
        text field_mention_us
        string field_test_login
    }

    JOB_SINGLE_REFS {
        int nid PK,FK
        int field_job_experience_term_tid FK
        int field_job_region_tid FK
    }

    JOB_EMPLOYMENT_TYPE {
        int nid PK,FK
        int delta PK
        int tid FK
    }

    JOB_LANGUAGES {
        int nid PK,FK
        int delta PK
        int tid FK
    }

    JOB_OCCUPATIONAL_FIELDS {
        int nid PK,FK
        int delta PK
        int tid FK
    }

    JOB_SKILLS_GENERAL {
        int nid PK,FK
        int delta PK
        int tid FK
    }

    JOB_SKILLS_IT {
        int nid PK,FK
        int delta PK
        int tid FK
    }

    JOB_QUALIFICATIONS {
        int nid PK,FK
        int delta PK
        int tid FK
    }
```

## Resume Profile Data Structure

```mermaid
erDiagram
    PROFILE_RESUME ||--|| FC_PERSONAL_INFO : "contains_1"
    PROFILE_RESUME ||--|| FC_JOB_PREFERENCES : "contains_1"
    PROFILE_RESUME ||--o{ FC_EXPERIENCE : "contains_many"
    PROFILE_RESUME ||--o{ FC_LANGUAGES : "contains_many"
    PROFILE_RESUME ||--o{ FC_SKILLS_GENERAL : "contains_many"
    PROFILE_RESUME ||--o{ FC_ATTACHMENTS : "contains_many"

    FC_JOB_PREFERENCES }o--|| TAX_CAREER_STATUS : "references"
    FC_JOB_PREFERENCES ||--o{ FC_JOBPREF_OCCUPATIONS : "has"
    FC_JOB_PREFERENCES ||--o{ FC_JOBPREF_REGIONS : "has"
    FC_JOB_PREFERENCES ||--o{ FC_JOBPREF_EMPLOYMENT : "has"

    FC_EXPERIENCE ||--o{ FC_XP_OCCUPATIONS : "has"
    FC_EXPERIENCE ||--o{ FC_XP_EMPLOYMENT : "has"

    FC_LANGUAGES }o--|| TAX_LANGUAGE : "references"
    FC_SKILLS_GENERAL }o--|| TAX_GENERAL_SKILL : "references"

    FC_ATTACHMENTS }o--|| FILE : "references"

    PROFILE_RESUME {
        int pid PK
        int uid FK,UK
        string label
        string field_resume_state
    }

    FC_PERSONAL_INFO {
        int item_id PK
        int pid FK
        string field_resume_firstname
        string field_resume_lastname
        string field_resume_salutation
        string field_resume_phone
        int field_resume_birthday
        string field_resume_address_country
        string field_resume_address_locality
        string field_resume_address_postal_code
        string field_resume_address_thoroughfare
        text field_resume_summary
        int field_resume_photo_fid FK
    }

    FC_JOB_PREFERENCES {
        int item_id PK
        int pid FK
        string field_resume_job_title
        decimal field_resume_desired_salary
        int field_resume_job_availability
        text field_resume_summary
        int field_resume_career_status_tid FK
    }

    FC_EXPERIENCE {
        int item_id PK
        int pid FK
        int delta
        string field_resume_job_title
        string field_resume_xp_organization
        string field_resume_xp_location
        int field_resume_time_period_start
        int field_resume_time_period_end
        text field_resume_summary
        string field_resume_xp_link_url
    }

    FC_LANGUAGES {
        int item_id PK
        int pid FK
        int delta
        int language_tid FK
        int field_resume_languages_level
        text field_resume_notes
    }

    FC_SKILLS_GENERAL {
        int item_id PK
        int pid FK
        int delta
        int skill_tid FK
        int field_resume_skills_general_lev
        text field_resume_notes
    }

    FC_ATTACHMENTS {
        int item_id PK
        int pid FK
        int delta
        int field_resume_attachments_file_fid FK
    }
```

## Taxonomy Vocabulary Structure

```mermaid
graph TB
    subgraph "Job-Related Vocabularies"
        V_EMPLOYMENT[Employment Type<br/>vid=4, 6 terms]
        V_EXPERIENCE[Years of Experience<br/>vid=12, 4 terms]
        V_OCCUPATIONAL[Occupational Fields<br/>vid=11, 11 terms<br/>HIERARCHICAL]
        V_INDUSTRY[Industry Fields<br/>vid=8, 54 terms]
        V_GENERAL_SKILLS[General Skills<br/>vid=6, 5 terms]
        V_IT_SKILLS[IT Skills<br/>vid=9, 156 terms]
        V_QUALIFICATIONS[Qualifications<br/>vid=13, 293 terms]
        V_ADDITIONAL_QUAL[Additional Qualifications<br/>vid=14, 336 terms]
        V_REJECTION[Job Application Rejection Reason<br/>vid=21, 0 terms]
    end

    subgraph "Resume-Related Vocabularies"
        V_CAREER_STATUS[Career Status<br/>vid=2, 3 terms]
        V_DEGREE[Degree Level<br/>vid=3, 5 terms]
        V_STUDY[Fields of Study<br/>vid=5, 36 terms<br/>HIERARCHICAL]
        V_LANGUAGES[Languages<br/>vid=10, 9 terms]
    end

    subgraph "Geographic Vocabularies"
        V_GEOGRAPHY[Geography<br/>vid=7, 237 terms]
    end

    subgraph "Content Vocabularies"
        V_TAGS[Tags<br/>vid=1, 378 terms]
    end

    subgraph "Kitesurf Vocabularies"
        V_ACTIVITIES[Activities<br/>vid=19, 296 terms]
        V_OFFERINGS[Offerings<br/>vid=20, 71 terms]
    end

    subgraph "Advertisement Vocabularies"
        V_AD_GROUPS[Ad Groups<br/>vid=18, 3 terms]
        V_AD_SIZE[Advertisement Size<br/>vid=15, 1 term]
    end

    style V_OCCUPATIONAL fill:#e1f5ff
    style V_STUDY fill:#e1f5ff
```

## Functional Dependencies Graph

```mermaid
graph LR
    subgraph "User Domain"
        UID[uid]
        UNAME[name]
        UMAIL[mail]
        UCREATED[created]
        USTATUS[status]

        UID --> UNAME
        UID --> UMAIL
        UID --> UCREATED
        UID --> USTATUS

        UNAME -.-> UID
        UMAIL -.-> UID
    end

    subgraph "Node Domain"
        NID[nid]
        VID[vid]
        NTYPE[type]
        TITLE[title]
        NUID[node.uid]
        NCREATED[created]

        NID --> VID
        NID --> NTYPE
        NID --> NUID
        NID --> NCREATED

        VID --> TITLE
        VID --> NID
    end

    subgraph "Profile Domain"
        PID[pid]
        PUID[profile.uid]
        PLABEL[label]
        PSTATE[resume_state]

        PID --> PUID
        PID --> PLABEL
        PID --> PSTATE

        PUID -.-> PID
    end

    subgraph "Taxonomy Domain"
        TID[tid]
        VID_TAX[vocabulary.vid]
        TNAME[term.name]
        PARENT[parent_tid]

        TID --> VID_TAX
        TID --> TNAME
        TID --> PARENT
    end

    subgraph "Job Domain"
        JNID[job.nid]
        JBODY[body]
        JEMAIL[job_email]
        JLOCATION[location]
        JSALARY[salary]
        JSTATE[workflow_state]

        JNID --> JBODY
        JNID --> JEMAIL
        JNID --> JLOCATION
        JNID --> JSALARY
        JNID --> JSTATE
    end

    subgraph "Multi-Value Fields"
        JNID_MV["(job.nid, delta)"]
        TID_EMPLOY[employment_type.tid]
        TID_SKILL[skill.tid]
        TID_LANG[language.tid]

        JNID_MV --> TID_EMPLOY
        JNID_MV --> TID_SKILL
        JNID_MV --> TID_LANG
    end

    style UID fill:#ffeb99
    style NID fill:#99ff99
    style PID fill:#99ccff
    style TID fill:#ffcc99
    style JNID fill:#ff99cc
```

## Data Flow: Job Application Process

```mermaid
sequenceDiagram
    participant U as User (uid)
    participant J as Job Node (nid)
    participant A as Application Node (nid)
    participant F as Flagging
    participant M as Message
    participant T as Tracked Event

    U->>J: Views Job (node_view event)
    J->>T: Create impression event

    U->>F: Bookmarks Job
    F->>J: Increment bookmark counter (f1)

    U->>A: Creates Job Application
    A->>J: References via field_job_application_job_ref
    A->>A: Set field_job_application_workflow = "submitted"

    A->>M: Trigger notification (r1)
    M->>U: Send email to job owner

    Note over A: Recruiter reviews application
    A->>A: Workflow transition (f3): submitted → reviewed

    alt Application Accepted
        A->>A: Workflow: reviewed → accepted
        A->>M: Send acceptance notification
    else Application Rejected
        A->>A: Workflow: reviewed → rejected
        A->>A: Set field_job_application_rej_reason (taxonomy term)
        A->>M: Send rejection notification
    end
```

## Normalization: 1NF → 2NF → 3NF Example

```mermaid
graph TB
    subgraph "1NF: Unnormalized (Hypothetical Original)"
        UNF["Job Table (1NF)<br/>nid | title | skills_list | email | owner_name | owner_email"]
    end

    subgraph "2NF: Remove Partial Dependencies"
        NF2_JOB["Job Table (2NF)<br/>nid | title | email | uid"]
        NF2_USER["User Table<br/>uid | name | email"]
        NF2_SKILL_LIST["Job_Skills (still problematic)<br/>nid | skills_csv"]
    end

    subgraph "3NF: Remove Transitive Dependencies + Multi-Value Normalization"
        NF3_JOB["Job_Core<br/>nid | title | email"]
        NF3_USER["User<br/>uid | name | email"]
        NF3_NODE["Node<br/>nid | uid"]
        NF3_SKILLS["Job_Skills<br/>nid | delta | tid"]
        NF3_TERM["Taxonomy_Term<br/>tid | name"]
    end

    UNF --> NF2_JOB
    UNF --> NF2_USER
    UNF --> NF2_SKILL_LIST

    NF2_JOB --> NF3_JOB
    NF2_JOB --> NF3_NODE
    NF2_USER --> NF3_USER
    NF2_SKILL_LIST --> NF3_SKILLS
    NF2_SKILL_LIST --> NF3_TERM

    NF3_NODE -.FK.-> NF3_USER
    NF3_JOB -.FK.-> NF3_NODE
    NF3_SKILLS -.FK.-> NF3_NODE
    NF3_SKILLS -.FK.-> NF3_TERM

    style UNF fill:#ffcccc
    style NF2_JOB fill:#ffffcc
    style NF2_USER fill:#ffffcc
    style NF2_SKILL_LIST fill:#ffcccc
    style NF3_JOB fill:#ccffcc
    style NF3_USER fill:#ccffcc
    style NF3_NODE fill:#ccffcc
    style NF3_SKILLS fill:#ccffcc
    style NF3_TERM fill:#ccffcc
```

## Cardinality Constraints Visualization

```mermaid
graph LR
    subgraph "One-to-One Relationships"
        USER_1["User"] -->|1:1| RESUME_1["Resume Profile"]
        RESUME_1 -->|1:1| PERSONAL_INFO["Personal Info<br/>Field Collection"]
        RESUME_1 -->|1:1| JOB_PREF["Job Preferences<br/>Field Collection"]
    end

    subgraph "One-to-Many Relationships"
        USER_M["User"] -->|1:N| NODE_M["Nodes"]
        USER_M -->|1:N| COMMENT_M["Comments"]
        NODE_M -->|1:N| COMMENT_N["Comments"]
        RESUME_M["Resume"] -->|1:N| EXPERIENCE_M["Experience Items"]
        RESUME_M -->|1:N| LANGUAGES_M["Language Items"]
    end

    subgraph "Many-to-Many via Junction Tables"
        JOB_MM["Job"] -->|N:M| EMPLOYMENT_TYPE["Employment Types<br/>via Job_Employment_Type"]
        JOB_MM -->|N:M| SKILLS_MM["Skills<br/>via Job_Skills_*"]
        JOB_MM -->|N:M| QUALIFICATIONS["Qualifications<br/>via Job_Qualifications"]
    end

    subgraph "Bounded Cardinality"
        JOB_B["Job"] -->|0..5| ACTIVITIES["Activities<br/>max 5 values"]
        KITESURF["Kitesurf Center"] -->|0..10| OFFERINGS["Offerings<br/>max 10 values"]
    end

    style USER_1 fill:#e1f5ff
    style RESUME_1 fill:#e1f5ff
    style USER_M fill:#ffe1e1
    style RESUME_M fill:#ffe1e1
    style JOB_MM fill:#e1ffe1
    style JOB_B fill:#fff5e1
```

## Pure Functions (Behavioral Layer)

```mermaid
graph TB
    subgraph "Computed Values"
        INPUT1[Input: nid, view_count]
        FUNC1[f1: listing_count_increment]
        OUTPUT1[Output: new_listing_count]

        INPUT2[Input: workflow_state, user_role]
        FUNC2[f2: workflow_state_transition]
        OUTPUT2[Output: new_workflow_state]

        INPUT3[Input: time_period_start, time_period_end]
        FUNC3[f6: datestamp_range_duration]
        OUTPUT3[Output: duration_months]

        INPUT4[Input: tid_geography]
        FUNC4[f7: geography_hierarchy_resolution]
        OUTPUT4[Output: country, region, city]

        INPUT5[Input: term_level_value]
        FUNC5[f5: term_level_score]
        OUTPUT5[Output: normalized_proficiency_0_to_1]
    end

    INPUT1 --> FUNC1 --> OUTPUT1
    INPUT2 --> FUNC2 --> OUTPUT2
    INPUT3 --> FUNC3 --> OUTPUT3
    INPUT4 --> FUNC4 --> OUTPUT4
    INPUT5 --> FUNC5 --> OUTPUT5

    style FUNC1 fill:#ccffcc
    style FUNC2 fill:#ccffcc
    style FUNC3 fill:#ccffcc
    style FUNC4 fill:#ccffcc
    style FUNC5 fill:#ccffcc
```

## System Architecture Layers

```mermaid
graph TB
    subgraph "Presentation Layer (EXCLUDED)"
        VIEWS[Views]
        BLOCKS[Blocks]
        MENUS[Menus]
        THEME[Theme/Templates]
    end

    subgraph "Behavioral Layer (P)"
        RULES[Rules Engine]
        COMPUTED[Computed Fields]
        WORKFLOWS[Workflow Transitions]
        FUNCTIONS[Pure Functions f1-f10]
    end

    subgraph "Configuration Layer (C)"
        FIELD_DEFS[Field Definitions]
        DEPENDENCIES[Functional Dependencies F_c]
        CARDINALITY[Cardinality Constraints]
        REFERENCES[Entity References]
    end

    subgraph "Entity Layer (E)"
        ENTITIES[Entity Types R1-R28]
        PRIMARY_KEYS[Primary Keys Kt]
        ATTRIBUTES[Attribute Sets At]
    end

    subgraph "Storage Layer (R_3NF)"
        DB_TABLES[Database Tables in 3NF]
        INDEXES[Indexes & Constraints]
        FK_CONSTRAINTS[Foreign Keys]
    end

    VIEWS -.excluded.-> THEME
    BLOCKS -.excluded.-> THEME
    MENUS -.excluded.-> THEME

    RULES --> FUNCTIONS
    COMPUTED --> FUNCTIONS
    WORKFLOWS --> FUNCTIONS

    FIELD_DEFS --> DEPENDENCIES
    DEPENDENCIES --> CARDINALITY
    CARDINALITY --> REFERENCES

    ENTITIES --> PRIMARY_KEYS
    PRIMARY_KEYS --> ATTRIBUTES

    FUNCTIONS --> ENTITIES
    REFERENCES --> ENTITIES
    ENTITIES --> DB_TABLES
    DB_TABLES --> INDEXES
    INDEXES --> FK_CONSTRAINTS

    style VIEWS fill:#ffcccc
    style BLOCKS fill:#ffcccc
    style MENUS fill:#ffcccc
    style THEME fill:#ffcccc
    style DB_TABLES fill:#ccffcc
    style ENTITIES fill:#ccffcc
```

---

## Legend

**Entity Relationship Notation:**
- `||--||` One-to-one relationship
- `||--o{` One-to-many relationship
- `}o--o{` Many-to-many relationship
- `}o--||` Many-to-one relationship
- `PK` Primary Key
- `FK` Foreign Key
- `UK` Unique Key

**Functional Dependency Notation:**
- `A → B` A functionally determines B
- `A -.-> B` B functionally determines A (reverse/unique constraint)

**Cardinality:**
- `1` Exactly one
- `0..1` Zero or one
- `N` or `*` Many (unlimited)
- `0..5` Up to 5 values

**Colors:**
- Green: Included in extraction (semantic data)
- Red: Excluded from extraction (presentation layer)
- Yellow: Intermediate normalization states
