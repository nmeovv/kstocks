# Context

**Performing entity** — a creditable act: a group, subunit, solo act, project
group, or collaboration. Identified by a UUID from the backend catalog. Called
**Artist** in every user-facing string.

**Person** — a human being. Distinct from a performing entity: a person may
belong to several acts and outlive all of them. No UI surface today.

**Artist credit** — the artist text printed on a release, as it came from the
source. Free text, never a link to a performing entity, and the two disagree
routinely.

**Release** — an album, EP, single, or compilation. Links to zero or more
performing entities; that link is set by a person, never inferred from artist
credits.
