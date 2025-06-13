# data-j
A lightweight front-end framework for those avoiding JavaScript as much as possible.

> No JS templates, no client-side routing, no build step.  Can I go now?

## Introduction

I've been using JavaScript for almost 30 years and I'm still not a fan. But I needed a way to do the kind of front-end web UI stuff that is expected of modern web applications.  Ajax forms, partial refreshes of pages and so on.  Most of the time, these actions follow recognizable patterns and conventions, and it seemed that a simple declarative approach would allow me to stay out of the realm of JavaScript coding most of the time.  Hence, data-j.

This is not going to work for everyone.  If you're all about React, Vue or whatever, and love building out full blown JavaScript MVC apps, you should use one of those tools.  However if you're happy to have your templates render on the server and want a simple, lightweight way to implement the web front end, give data-j a look.

### What data-j is good for

* Ajax views, buttons, forms etc.  Usually coded without dipping into JavaScript at all.
* Dependency on JQuery.  That is it.
* Easy things easy, hard things possible.  You can develop custom behavior in JavaScript if you need to.

### What data-j is NOT good for

* Client-side template rendering.  Our use case uses server-side templates, and that's where we like them.
* Extensive development of business logic in JavaScript.  If this is what you want, please check out the many established MVC frameworks, all of which are more suited to heavy JavaScript client apps than data-j.  We're keeping it light here.
* Modular plug-ins to do a million things.  Well, we actually play perfectly nice with the world of JQuery plugins, but we don't have any sort of plug-in framework ourselves.  Again, limited (but very common) cuse cases.

### Features:

#### Elements

* **Buttons** (j-btn): Trigger an ajax load or function call from a button click.
* **Views** (j-view): Load dynamic content automatically into a div.
* **Forms** (j-form): Ajax forms
* **Timers** (j-timer): Load an endpoint or execute a function after a delay.
* **Permalinks** (j-permalink): Copy the href onto the clipboard automatically.
* **Navs** (j-nav): Site navigation.

## How to Install

Download the data_j.js script and include it before the end of the body.  To invoke for the document, call `data_j()`.

```html
<body>
	...
	<script src="/path/to/jquery.js"></script>
	<script src="/scripts/data_j.js"></script>
	<script>
		data_j();
	</script>
</body>
```

Alternately, if you just want data-j to govern a subset of the page, you can pass a jQuery parent selector.  Data-j will only look at elements below the scope of the parent selector.

```html
<script>
	// will only work on child elements of the element with id 'active-area'.
	data_j('#active-area');
</script>
```

## Usage

```html
<a href="#" id="mybutton" class="j-btn" data-j="*/path/to/partial/|my-view">I'm an Ajax button!</a>
```

This, when clicked, loads an endpoint into a div.  Most data-j elements will contain the following:

1. An **HTML tag**.
2. An **id**.  Data-j requires the id in order to link functionality to the element.
3. A **class** binding the element to on of the established data-j functions.  For example, a `j-btn` triggers an ajax load or a function call when clicked.
4. A **control string** which specifies the behavior of the data-j element.  Control strings are defined under the element's `data-j` attribute.  More about control strings below.


## Buttons

```html
<a href="#" id="loader-button" class="j-btn" data-j="*/some/endpoint|target-view~">Click Me!</a>
```

**Class: `j-btn`**

#### Endpoint Loader

An endpoint loader makes an ajax call and loads the response into the specified target (usually a div).

Control string:
`*[endpoint-path]|[target-id]`

Example: 
```html
<a href="#" id="loader-button" class="j-btn" data-j="*/some/endpoint|target-view">Click Me!</a>

<div id="target-view">Endpoint will be loaded right here.</div>
```

When clicked this will load an endpoint (prefixed by `*`) into a target (prefixed by `|`).

#### Function call

Similar to an endpoint loader, but instead calls a JavaScript function (that you have to implement) and loads the returned value into a specified target.

Control string: `@[functionName]:[arg1],[arg2]`

Example: 
```html
<a href="#" id="function-button" class="j-btn" data-j="@myFunction:hello,world">Hello World</a>

<script>
	function myFunction(firstArg, secondArg) {
		alert(firstArg+' '+secondArg); // alerts 'hello world'
	}
</script>
```

#### Fader

Toggles the visibility of the specified target.  Faders take JQuery selectors, so its possible to fade multiple elements with the right JQuery expression.

Control string: `%#selector-to-toggle-fade`

Example:
```html
<a href="#" id="fader-button" class="j-btn" data-j="%#div-to-disappear">Make it Vanish!</a>

<div id="div-to-disappear">Watch me vanish!</div>
```


#### Component Reloader

Reloads a Component (see Components).

Control String: `=[component id]`

### Button Suffix Modifiers

By adding modifier characters to the end of button control strings, you can trigger additional funcitonality.

#### Reload Views

The `~` character added to the end of a control string will cause all j-view elements to automatically reload when the button is pressed. (See J-Views).

Control string: `[main control string]~`

Example:
```html
<a href="#" id="loader-button" class="j-btn" data-j="*/some/endpoint/|target-view~">Click Me!</a>
```

#### Additional Fader

The `;` character appended to the control string will trigger a fade on a specified target, in addition to the main behavior of the control string.

Control string: `[main control string];[fader-target]`

Example:
```html
<a href="#" id="loader-button" class="j-btn" data-j="*/some/endpoint/|target-view;.fade-element">Click Me!</a>
<div id="fade-element-1" class="fade-element">I'm going to disappear.</div>
<div id="fade-element-2" class="fade-element">I'm also going to disappear.</div>
```

### Browser Exclusions

Data-j can selectively not show buttons to specified types of browsers.  This is to limit functionality when browsers may have functional limitations that you want to avoid.

```html
<a href="#" id="not-safari-friendly" class="j-btn" data-j="@notsafarifriendly" data-exclude-ua="safari">Just Chromin'</a>
```

In the above example, the button won't render on Safari at all.

## Ajax Forms

Data-J provides ajax forms, which override the default HTML form behavior.  The form will submit without refreshing the page.  In a `j-form` the behavior of the form before an after submission can be set by the control string.

**Class: j-form**

```html
<form id="my-form" action="/form/endpoint/" method="POST" class="j-form" data-j="%#form-div">
	...
</form>
```

#### Form Preflight Check Function

A preflight check function will run _before_ the form submits.

Control string: `@[preflight function name]:[arg1],[arg2]`

Example
```html
<form id="my-form" action="/form/endpoint/" method="POST" class="j-form" data-j="@validate_state:foo,bar">
	...
</form>

<script>
	// Runs BEFORE the form submits
	function validate_state(arg1, arg2) {
		alert("State: "+arg1+" "+arg2);
	}
</script>
```

#### Form Success Function

Like a preflight check, but the success function runs after the form submits, and receives a non-error response from the server.

Control string: `+[success function name]:[arg1],[arg2]`

Example:
```html
<form id="my-form" action="/form/endpoint/" method="POST" class="j-form" data-j="+on_success:foo,bar">
	...
</form>

<script>
	// Runs AFTER the form submits, on a non-error response
	function on_success(arg1, arg2) {
		alert("Woohoo! "+arg1+" "+arg2);
	}
</script>
```

#### Form Success Fader

Fades out the targets on after form submits on a non-error response from the server.

Control string: `%[jquery selector]`

Example:
```html
<form id="my-form" action="/form/endpoint/" method="POST" class="j-form" data-j="%#fade-away">
	...
</form>

<div id="fade-away">Bye bye!</div>
```

#### Form Success Component Reloader

Reloads a Component (see Components).

Control string: `=[component id]`


### Ajax Form Suffix Modifiers

Like Buttons, `~` will reload all J-Views, `;` will append a fade function. In addition there is:

#### Flash

The `!` character appending to the control string will cause a Flash message (see Flash).

Control string: `[main control string]![flash message]`

Example:

```html
<form id="my-form" action="/form/endpoint/" method="POST" class="j-form" data-j="+on_success:foo,bar!You did it">
	...
</form>
```

## Navs

Navs implement functionality controlling site navigation, showing both navigation state as well as triggering behavior similiar to buttons.

**Class: j-nav**

```html
<ul id="my-nav" class="j-nav">
	<li><a href="#" id="home-link" class="nav-link" data-j="*/home/|main-dialog" data-j-location="home">Home</a></li>
	<li><a href="#" id="about-link" class="nav-link" data-j="*/about/|main-dialog" data-j-location="about">About</a></li>
	<li><a href="#" id="logout-link" class="nav-link" data-j="@logout">Log Out</a></li>
</ul>
```

Nav links essentially work like buttons (j-btn) but with the additional property of updating the state of the nav, showing a visual indication to the user where they have navigated, as well as the location in the address bar, by appending a `#location` to the end of the address.

#### Nav Location & Auto-Nav

In the example above, assuming the address bar simply shows `https://example.com/` as the location.  Clicking on the nav links will update the contents of a div with the id `main-dialog`, and not change the location on the address bar.  However because the `data-j-location` attribute is set on the nav links, the value of that attribute will be appended to the address.  For example, clicking the "About" link will update the address to

`https://www.example.com/#about`

In addition, data-j implement auto-navigation.  This means that if someone loads the page with a recognized nav location (matching a nav link's `data-j-location` attribute), it will automatically execute the nav-link control string for that nav link.  So, again from the above example, navigating to `https://example.com/#about` will automatically trigger the About nav link, which will load the endpoint `/about/` into the target element with the id `main-dialog`.

#### Visual Nav State

When a nav link is clicked on, the class `active` will be added to it and will be removed from all other nav links.  This is intended as a hook for CSS to visually show the active nav link.

## Views

A View is an element (usually a div) that dynamically loads content.

**Class: j-view**

```html
<div id="status-panel" class="j-view" data-j="*/status/"></div>
```

In this example the element will automatically load the response from the endpoint `/status/` when it itself is loaded onto the page.

Views can either load from an endpoint (as shown above) or load from the value returned from a function.  Function-loading views are implemented like this:

```html
<div id="function-loading-view" class="j-view" data-j="@viewloader:hello,world"></div>

<script>
	function viewloader(arg1, arg2) {
		return '<h1>'+arg1+' '+arg2+'</h1>';
	}
</script>
```

#### Global Reload

J-views can be triggered to automatically reload by any element (usually buttons and ajax forms) that include the `~` character in their control strings.  This is usually done universally on a page, to reflect a state update.  So for example a button like this:

```html
<a href="#" id="update-btn" class="j-btn" data-j="*/make-update/~">Update</a>
```

will cause *all* of the j-views on the page to reload once the endpoint in the button's control string has been called.

## Components

Components are a more fine-grained version of Views, and can be used to reload just part of the user interface as required.

**Class: j-comp**

```html
<div id="my-component" class="j-comp" data-j="*/component-contents/"></div>

<a href="#" id="component-reload-btn" class="j-btn" data-j="=my-component">Reload!</a>
```

Unlike views, components will not automatically load, however they can be triggered to reload their own specified endpoint (or function) by a button or form, using the `=` control character.


## Flash

Flash is a utility to show temporary status messages to the user.  Flash requires an element on the page with the id "flash".

```html
<div id="flash" class="hidden"></div> <!-- flash usually starts hidden, ie display:none -->

<a href="#" id="flash-btn" class="j-btn" data-j="@dosomething!Something Done">Do Something</a>
```

In the above example, clicking the "Do Something" button will call the `dosomething` function, then flash the message "Something Done".  CSS can be used to control the appearance of the `flash` element.

## Timers

A Timer (j-timer) executes a control string after a specified pause.

**Class: j-timer**

Control String: `[num seconds];[control string]`

```html
<div id="my-timer" class="j-timer" data-j="10;~"><div>
```

In the above example all the j-views will refresh after 10 seconds.  Control string can either be a function call (`@myfunction:arg1,arg2`), an endpoint load (`*/some/path/|target`), or a straight view refresh (`~`)


## Permalinks

Permalinks facilitate the "click to copy URL" functionality that you see sometimes.

```html
<a href="https://example.com" class="j-permalink">Click to Copy URL</a>
```

Clicking this link will *not* forward the browser to the specified page, but rather copy the value in the href attribute to the user's clipboard.

---

## Known Issues

This thing is still pretty new, and has signs of immaturity.  A (totally not-exhaustive) list of issues:

* Needs better debugging.  Too easily to get it to silently fail.
* We have a lot of `eval()` calls, which can be scary.  We might want to add some checks like:
```javascript
if (typeof window[target_function] === "function") {
    window[target_function](...args);
} else {
    console.error(`Function ${target_function} not found`);
}
````
* Function calls assume global scope.  Might be nice to accept some sort of function scoping.
* Nothing preventing duplicate binding of events to buttons.  Probably need to call `.off()` on buttons before binding.
* Need a minified version.  CDN hosting would also be nice.
* Some suffix modifiers (such as `!`) should work anywhere (buttons, forms, whatever) and right now they don't.
