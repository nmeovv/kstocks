# Base vs Radix

API differences between `base` and `radix`. Check the `base` field from `npx shadcn@latest info`.

## Contents

- Primitive source selection
- Composition: asChild vs render
- Button / trigger as non-button element
- Select (items prop, placeholder, positioning, multiple, object values)
- ToggleGroup (type vs multiple)
- Slider (scalar vs array)
- Accordion (type and defaultValue)

---

## Primitive source selection

The project's `base` value selects the primitive implementation, not only the prop API. Check current component docs and their linked API before choosing imports or installing dependencies.

**Incorrect (base Drawer):** using the legacy Vaul-backed implementation from memory.

```tsx
import { Drawer } from "vaul"
```

**Correct (base Drawer):** using the current Base UI primitive.

```tsx
import { Drawer } from "@base-ui/react/drawer"
```

In Base UI, `Drawer.Handle` is the imperative handle type returned by `Drawer.createHandle()`; it is not the visible drag affordance. Render the visual grip as styled markup inside `Drawer.Popup`, following the current Drawer example.

Only add Vaul when the current selected registry item explicitly declares it. If registry access fails, inspect the installed primitive family or retry the docs request; do not substitute an older implementation.

---

## Composition: asChild (radix) vs render (base)

Radix uses `asChild` to replace the default element. Base uses `render`. Don't wrap triggers in extra elements.

**Incorrect:**

```tsx
<DialogTrigger>
  <div>
    <Button>Open</Button>
  </div>
</DialogTrigger>
```

**Correct (radix):**

```tsx
<DialogTrigger asChild>
  <Button>Open</Button>
</DialogTrigger>
```

**Correct (base):**

```tsx
<DialogTrigger render={<Button />}>Open</DialogTrigger>
```

This applies to all trigger and close components: `DialogTrigger`, `SheetTrigger`, `AlertDialogTrigger`, `DropdownMenuTrigger`, `PopoverTrigger`, `TooltipTrigger`, `CollapsibleTrigger`, `DialogClose`, `SheetClose`, `NavigationMenuLink`, `BreadcrumbLink`, `SidebarMenuButton`, `Badge`, `Item`.

---

## Button / trigger as non-button element (base only)

When `render` changes an element to a non-button (`<a>`, `<span>`), add `nativeButton={false}`.

**Incorrect (base):** missing `nativeButton={false}`.

```tsx
<Button render={<a href="/docs" />}>Read the docs</Button>
```

**Correct (base):**

```tsx
<Button render={<a href="/docs" />} nativeButton={false}>
  Read the docs
</Button>
```

**Correct (radix):**

```tsx
<Button asChild>
  <a href="/docs">Read the docs</a>
</Button>
```

Same for triggers whose `render` is not a `Button`:

```tsx
// base.
<PopoverTrigger render={<InputGroupAddon />} nativeButton={false}>
  Pick date
</PopoverTrigger>
```

---

## Select

**items prop (base only).** Base requires an `items` prop on the root. Radix uses inline JSX only.

**Incorrect (base):**

```tsx
<Select>
  <SelectTrigger><SelectValue placeholder="Select a fruit" /></SelectTrigger>
</Select>
```

**Correct (base):**

```tsx
const items = [
  { label: "Select a fruit", value: null },
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
]

<Select items={items}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      {items.map((item) => (
        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
      ))}
    </SelectGroup>
  </SelectContent>
</Select>
```

**Correct (radix):**

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

**Placeholder.** Base uses a `{ value: null }` item in the items array. Radix uses `<SelectValue placeholder="...">`.

**Content positioning.** Base uses `alignItemWithTrigger`. Radix uses `position`.

```tsx
// base.
<SelectContent alignItemWithTrigger={false} side="bottom">

// radix.
<SelectContent position="popper">
```

---

## Select — multiple selection and object values (base only)

Base supports `multiple`, render-function children on `SelectValue`, and object values with `itemToStringValue`. Radix is single-select with string values only.

**Correct (base — multiple selection):**

```tsx
<Select items={items} multiple defaultValue={[]}>
  <SelectTrigger>
    <SelectValue>
      {(value: string[]) => value.length === 0 ? "Select fruits" : `${value.length} selected`}
    </SelectValue>
  </SelectTrigger>
  ...
</Select>
```

**Correct (base — object values):**

```tsx
<Select defaultValue={plans[0]} itemToStringValue={(plan) => plan.name}>
  <SelectTrigger>
    <SelectValue>{(value) => value.name}</SelectValue>
  </SelectTrigger>
  ...
</Select>
```

---

## ToggleGroup

Base uses a `multiple` boolean prop. Radix uses `type="single"` or `type="multiple"`.

**Incorrect (base):**

```tsx
<ToggleGroup type="single" defaultValue="daily">
  <ToggleGroupItem value="daily">Daily</ToggleGroupItem>
</ToggleGroup>
```

**Correct (base):**

```tsx
// Single (no prop needed), defaultValue is always an array.
<ToggleGroup defaultValue={["daily"]} spacing={2}>
  <ToggleGroupItem value="daily">Daily</ToggleGroupItem>
  <ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
</ToggleGroup>

// Multi-selection.
<ToggleGroup multiple>
  <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
  <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
</ToggleGroup>
```

**Correct (radix):**

```tsx
// Single, defaultValue is a string.
<ToggleGroup type="single" defaultValue="daily" spacing={2}>
  <ToggleGroupItem value="daily">Daily</ToggleGroupItem>
  <ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
</ToggleGroup>

// Multi-selection.
<ToggleGroup type="multiple">
  <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
  <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
</ToggleGroup>
```

**Controlled single value:**

```tsx
// base — wrap/unwrap arrays.
const [value, setValue] = React.useState("normal")
<ToggleGroup value={[value]} onValueChange={(v) => setValue(v[0])}>

// radix — plain string.
const [value, setValue] = React.useState("normal")
<ToggleGroup type="single" value={value} onValueChange={setValue}>
```

---

## Slider

Base accepts a plain number for a single thumb. Radix always requires an array.

**Incorrect (base):**

```tsx
<Slider defaultValue={[50]} max={100} step={1} />
```

**Correct (base):**

```tsx
<Slider defaultValue={50} max={100} step={1} />
```

**Correct (radix):**

```tsx
<Slider defaultValue={[50]} max={100} step={1} />
```

Both use arrays for range sliders. Controlled `onValueChange` in base may need a cast:

```tsx
// base.
const [value, setValue] = React.useState([0.3, 0.7])
<Slider value={value} onValueChange={(v) => setValue(v as number[])} />

// radix.
const [value, setValue] = React.useState([0.3, 0.7])
<Slider value={value} onValueChange={setValue} />
```

---

## Accordion

Radix requires `type="single"` or `type="multiple"` and supports `collapsible`. `defaultValue` is a string. Base uses no `type` prop, uses `multiple` boolean, and `defaultValue` is always an array.

**Incorrect (base):**

```tsx
<Accordion type="single" collapsible defaultValue="item-1">
  <AccordionItem value="item-1">...</AccordionItem>
</Accordion>
```

**Correct (base):**

```tsx
<Accordion defaultValue={["item-1"]}>
  <AccordionItem value="item-1">...</AccordionItem>
</Accordion>

// Multi-select.
<Accordion multiple defaultValue={["item-1", "item-2"]}>
  <AccordionItem value="item-1">...</AccordionItem>
  <AccordionItem value="item-2">...</AccordionItem>
</Accordion>
```

**Correct (radix):**

```tsx
<Accordion type="single" collapsible defaultValue="item-1">
  <AccordionItem value="item-1">...</AccordionItem>
</Accordion>
```
