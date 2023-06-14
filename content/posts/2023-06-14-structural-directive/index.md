---
title: "Using structural directives"
date: "2023-06-14"
---

Today, I finally got a chance to explore structural directives in Angular. It's actually really nice to use for any kind of DOM insertion/adjustment
purposes :)

## How structural directives work

* Create an Angular directive
* At construction time, you will be able to use DI to get a ViewContainerRef and a TemplateRef
* At some point, you should call `viewContainerRef.createEmbeddedView(templateRef)` to put the element into the DOM
* At any point, you can also call `viewContainerRef.clear()` to tear down everything
* It's up to you to decide when to create or delete the DOM

Here's what they actually look like, in code:

```typescript
import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[mySelector]',
})
export class MyDirective {
    constructor(private viewContainerRef: ViewContainerRef, private templateRef: TemplateRef<any>) {
        // do anything...
        this.viewContainerRef.createEmbeddedView(templateRef);
    }
}
```

You can even call `createEmbeddedView` multiple times, or 0 times!

It is quite useful for e.g. implementing ngIf or ngFor.

## How you use structural directives

Now that the directive is ready, you can add them to your NgModule and refer to them in component templates:

```html
<div *mySelector>time for some cursed structural directives</div>
```

## Use-cases

There's quite a lot you can do with that power. Here are some cursed use-cases.

### Rendering multiple copies

For example, render multiple copies of your DOM element:

```typescript
import { Directive, TemplateRef, ViewContainerRef, OnDestroy } from '@angular/core';

@Directive({
    selector: '[mySelector]',
})
export class MyDirective implements OnDestroy {
    private interval: number;

    constructor(private viewContainerRef: ViewContainerRef, private templateRef: TemplateRef<any>) {
        this.render();
        this.interval = setInterval(() => this.render(), 1000);
    }

    render() {
        this.viewContainerRef.clear();
        const counter = (Date.now() / 1000) % 10;
        for (let i = 0; i < counter; i += 1) {
            this.viewContainerRef.createEmbeddedView(templateRef);
        }
    }

    ngOnDestroy() {
        clearInterval(this.interval);
    }
}
```

### Rendering multiple copies

For example, rendering other components in front of the given element:

```typescript
import { Directive, TemplateRef, ViewContainerRef, Input } from '@angular/core';

@Component({
    selector: 'my-component',
    template: 'hello, world: {{ value }}',
})
export class MyComponent {
    @Input() value?: string;
}

@Directive({
    selector: '[mySelector]',
})
export class MyDirective {
    constructor(private viewContainerRef: ViewContainerRef, private templateRef: TemplateRef<any>) {
        this.render();
    }

    render() {
        const component = this.viewContainerRef.createComponent(MyComponent);
        this.viewContainerRef.createEmbeddedView(templateRef);
    }
}
```

## Example

Here's a more interactive example as well:

<iframe referrerpolicy="no-referrer" src="https://stackblitz.com/edit/stackblitz-starters-mgr7gt?embed=1&file=src%2Fmain.ts"></iframe>