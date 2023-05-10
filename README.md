# DZ Unimport

retro [unjs/unimport](https://github.com/unjs/unimport)

## Usage

**Name import**

```ts
imports: [
  { name: 'ref', from: 'vue' },
  { name: 'useState', as: 'useSignal', from: 'react' },
]
```

Will be injected as:

```ts
import { ref } from 'vue'
import { useState as useSignal } from 'react'
```
