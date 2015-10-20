/**
 * DomInspector
 *
 * Based on https://github.com/oldprojects/Simple-JavaScript-DOM-Inspector/ (see 'initialise.source.js').
 *
 * Usage:   var options = {}; // See 'initialise' method for attributes.
 *          var inspector = new DomInspector(options);
 *
 * @param Object options    Initialisaton object (see 'initialise' method).
 * @return Object           Public members.
 *
 * Notes:   Requires jQuery.
 *
 * */
function DomInspector (options)
{
    var escapeKeyCode = 27;

    var options,
        $document,
        last,
        inspecting,
        path,
        element;

    /**
     * Extracts the css path of the passed element.
     *
     * @param Element el    DOM element to inspect (http://api.jquery.com/Types/#Element), passed via click handler event target (http://api.jquery.com/event.target/).
     * @return string
     *
     * */
    var cssPath = function (el)
    {
        element = el;

        var fullPath = options.fullPath === true ? 1 : 0, // Set to 1 to build ultra-specific full CSS-path, or 0 for optimised selector
            useNthChild = options.useNthChild === true ? 1 : 0, // Set to 1 to use ":nth-child()" pseudo-selectors to match the given element
            cssPathStr = '',
            testPath = '',
            parents = [],
            parentSelectors = [],
            tagName,
            cssId,
            cssClass,
            tagSelector,
            vagueMatch,
            nth,
            i,
            c;

        while (el) { // Go up the list of parent nodes and build unique identifier for each.

            vagueMatch = 0;
            
            tagName = el.nodeName.toLowerCase(); // Get the node's HTML tag name in lowercase.
            
            cssId = (el.id) ? ('#' + el.id) : false; // Get node's ID attribute, adding a '#'.
            
            cssClass = (el.className) ? ('.' + el.className.replace(/\s+/g, ".")) : ''; // Get node's CSS classes, replacing spaces with '.'.            
            
            // Build a unique identifier for this parent node.
            if (cssId) {
                tagSelector = tagName + cssId + cssClass; // Matched by ID.
            } else if (cssClass) {
                tagSelector = tagName + cssClass; // Matched by class (will be checked for multiples afterwards).
            } else {
                vagueMatch = 1; // Couldn't match by ID or class, so use ":nth-child()" instead.
                tagSelector = tagName;
            }

            tagSelector = tagSelector.replace(/\.+$/, ''); // Ensure selector doesn't end with a '.'.

            parentSelectors.unshift(tagSelector); // Add this full tag selector to the parentSelectors array.

            if (cssId && !fullPath) break; // If doing short/optimised CSS paths and this element has an ID, stop here.

            el = el.parentNode !== document ? el.parentNode : false; // Go up to the next parent node.


        }

        // Build the CSS path string from the parent tag selectors.
        for (i = 0; i < parentSelectors.length; i++) {

            cssPathStr += ' ' + parentSelectors[i]; // + ' ' + cssPathStr;

            // If using ":nth-child()" selectors and this selector has no ID / isn't the html or body tag...
            if (useNthChild && !parentSelectors[i].match(/#/) && !parentSelectors[i].match(/^(html|body)$/)) {

                // If there's no CSS class, or if the semi-complete CSS selector path matches multiple elements...
                if (!parentSelectors[i].match(/\./) || $(cssPathStr).length > 1) {

                    // Count element's previous siblings for ":nth-child" pseudo-selector.
                    for (nth = 1,
                        c = el;
                        c !== null && c.previousElementSibling;
                        c = c.previousElementSibling,
                        nth++);

                    // Append ":nth-child()" to CSS path.
                    cssPathStr += ":nth-child(" + nth + ")";

                }
            }
        }

        return cssPathStr.replace(/^[ \t]+|[ \t]+$/, ''); // Return trimmed full CSS path.
    };

    /**
     * Mouse over handler.
     *
     * @param Event event   jQuery click mouseover event object (http://api.jquery.com/mouseover/).
     * @return void
     *
     * */
    var onMouseOver = function (e)
    {
        var element = e.target; // NB: This doesn't work in IE (needs fix).

        element.style.outline = options.outline || '2px solid red'; // Set outline.
        element.style.cursor = options.cursor || 'auto';

        last = element; // Set last selected element so it can be 'deselected' on onKeyDown.
    };

    /**
     * Mouse out handler.
     *
     * @param Event event   jQuery click mouseout event object (http://api.jquery.com/mouseout/).
     * @return void
     *
     * */
    var onMouseOut = function (e)
    {
        e.target.style.outline = ''; // Remove outline from element.
        e.target.style.cursor = 'auto';
    };

    /**
     * Click handler.
     *
     * @param Event event   jQuery click event object (https://api.jquery.com/click/).
     * @return boolean
     *
     * */
    var onClick = function (e)
    {
        e.preventDefault && e.preventDefault();

        path = cssPath(e.target);

        var clickData = {
            path: path,
            $element: $(element),
            event: e
        };

        options.onClick && options.onClick(clickData);

        options.stopOnClick && stopInspecting();

        return false;
    };

    /**
     * Key down handler.
     *
     * @param Event event   jQuery keydown event object (https://api.jquery.com/keydown/).
     * @return void
     *
     * */
    var onKeyDown = function (e)
    {
        console.log(e);
        if (e.which === escapeKeyCode) {
            options.stopOnEscape && stopInspecting();
        }

        options.onKeyDown && options.onKeyDown(e);
    };

    /**
     * Starts the inspector.
     *
     * @throws "Document required" exception.
     * @return void
     *
     * */
    var startInspecting = function ()
    {
        if (!$document) {
            throw "Document required.";
        }

        if (inspecting) {
            return;
        }
        inspecting = true;

        $document
        .on('mouseover', onMouseOver)
        .on('mouseout', onMouseOut)
        .on('click', onClick);

        if (options.keyContext || false) {
            $(options.keyContext).on('keydown', onKeyDown);
        } else {
            $document.on('keyDown', onKeyDown);
        }
    };

    /**
     * Stops the inspector.
     *
     * @return void
     *
     * */
    var stopInspecting = function ()
    {
        if (!inspecting) {
            return;
        }
        inspecting = false;

        $document
        .off('mouseover', onMouseOver)
        .off('mouseout', onMouseOut)
        .off('click', onClick);

        if (options.keyContext || false) {
            $(options.keyContext).off('keydown', onKeyDown);
        } else {
            $document.off('keyDown', onKeyDown);
        }

        last.style.outline = 'none';

        options.onStop && options.onStop();
    };

    /**
     * Initialises the inspector.
     *
     * @param Object _options   Initialisation object (underscored to avoid collisions with local 'options').
     * @return void
     *
     * */
    var initialise = function (_options)
    {
        stopInspecting();

        $document = false,
        last = false,
        inspecting = false,
        path = false,
        element = false;

        /**
         * Merge passed options with defaults (listed below).
         *
         * */
        options = $.extend(true, {

            /**
             * Contexts.
             *
             * */
            document: document,
            keyContext: document, 

            /**
             * Booleans.
             *
             * */
            fullPath: false,
            useNthChild: true,
            stopOnClick: false,
            stopOnEscape: true,
            startOnInitialise: true,

            /**
             * Mouse event styles.
             *
             * */
            outline: '1px solid red',
            cursor: 'pointer',

            /**
             * Events.
             *
             * */
            onClick: function (data) {
                console.log(data.path);
            },
            onStop: null,
            onKeyDown: null,

        }, _options || {});

        /**
         * If the document it passed, wrap it in a jQuery object.
         *
         * */
        if (options.document || false) {
            $document = $(options.document);
        }

        /**
         * Unless instructed *not* to, start inspecting.
         *
         * */
        if ($document) {
            options.startOnInitialise && startInspecting();
        }
    };

    /**
     * Initialise the inspector with any instantiation options.
     *
     * */
    initialise(options);

    /**
     * Public members.
     *
     * */
    return {

        initialise: initialise,
        startInspecting: startInspecting,
        stopInspecting: stopInspecting,
        getPath: function () {
            return path;
        }

    };

}
