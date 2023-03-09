---
title: "You can detect password managers with mutation observers"
date: "2023-03-09"
---

You can detect password managers with mutation observers.

Makes sense, since they have to insert their UI into the DOM next to the 
password fields.

```javascript
<script>
new MutationObserver((mutationList) => { 
    const has1password = mutationList
        .filter(event => event.type === 'childList')
        .map(event => [...event.addedNodes])
        .flat(1)
        .some(node => node.nodeName === 'COM-1PASSWORD-BUTTON');
    if (has1password) { 
        console.log("hello 1password"); 
    }
}).observe(document.body, { childList: true, subtree: true });
</script>
```
