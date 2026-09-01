# Analytics event naming

Portfolio events follow StayHireable's dot-separated, snake_case taxonomy:

```text
{module}.{entity}.{action}.{status?}
```

- `module`: route or experience, such as `stories`, `writings`, `projects`,
  or `v2`
- `entity`: UI element or product concept, such as `page`, `music`, or
  `work_panel`
- `action`: past-tense verb, such as `viewed`, `clicked`, or `opened`
- `status`: outcome when relevant: `initiated`, `success`, or `failure`

Examples:

```text
stories.page.viewed
stories.page.scrolled
v2.work_panel.opened
v2.music.playback.success
v2.music.playback.failure
app.runtime.failed
```

Property keys use `snake_case`. Every event includes `app`, `environment`,
`version`, a query-free `url`, a sanitized `path`, a query-free `referrer`,
and available UTM parameters.

Global tracking covers page views, semantic clicks, form submissions, input
changes without values, 25/50/75/100 percent scroll checkpoints, runtime
errors, and unhandled promise failures. Feature code adds explicit events for
important outcomes. Autocapture and session replay are disabled.

`NEXT_PUBLIC_MIXPANEL_TOKEN` must be the public browser token from the
Mixpanel project named `portfolio`.
