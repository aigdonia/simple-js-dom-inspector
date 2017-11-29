# DomInspector

Based on [oldprojects/Simple-JavaScript-DOM-Inspector](https://github.com/oldprojects/Simple-JavaScript-DOM-Inspector) \(see `inspector.source.js`).

By default, it…

• styles hovered elements,
• logs the clicked element to the console,
• cancels on Escape key,

…though it's fully configurable via its `options` parameter.

### Usage

    var options = {}; // See 'initialise' method for attributes.
    var inspector = new DomInspector(options);
