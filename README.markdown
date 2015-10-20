#DomInspector

Based on [oldprojects/Simple-JavaScript-DOM-Inspector](https://github.com/oldprojects/Simple-JavaScript-DOM-Inspector) \(see `inspector.source.js`).

Be fault, it

- styles hovered elements,
- logs the clicked element to the console,
- cancels on Escape key,

though it is fully configurable via initialisation `object` argument.

###Usage

    var options = {}; // See 'initialise' method for attributes.
    var inspector = new DomInspector(options);
