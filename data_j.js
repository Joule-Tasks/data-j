// ==================================================================
// = JS Engine for Those Annoyed by JS Frameworks. Get off my lawn. =
// ==================================================================

// Depends on JQuery - that's it.
//
// <div id="my-view" class="j-view" data-j="*/tasks/all/"></div>
// ^ will automatically load endpoint into div
//
// <div id="my-view" class="j-view" data-j=":load_tasks()"></div>
// ^ will automatically load output from function into div
//
// <a href="#" class="j-btn" data-j="*/tasks/all/|my-view">Load Tasks</a>
// ^ clicking loads endpoint into target view
//
// <a href="#" class="j-btn" data-j="@load_tasks()|my-view">Load Tasks</a>
// ^ clicking loads function output into target view
//
// <a href="#" class="j-btn" data-j="*/do-something/;my-view~">Do Something</a>
// ^ clicking will load endpoint, but will fade specified targets after the ';'
// character.
//
// <form id="my-form" action="/tasks/add/" class="j-form" data-j="@preflight('my-form')+postTaskAdd">...</form>
// ^ form will be submitted as ajax, run 'preFlight' pre-submit, 'postTaskAdd' on return
//
//
// Faders: special function to toggle visibility
//
// <a href="#" class="j-btn" data-j="%#target">Cancel</a>
// % indicates a fader.  Following is the jquery selector of the element to be
// toggled.  In the above example the elment of id 'target' will be toggled.
//
// <a href="#" class="j-btn" data-ja="%^#target">Cancel</a>
// If the selector starts with a ^ character, then the parent of the henceforth
// specified selector will be targeted.  In this case the parent of the element with
// id "target" will be toggled.
//
// <div id="my-timer" class="j-timer" data-j=";60;*/tasks/all/|some-view"></div>
// J-timers will execute the control string after the specified number of seconds.
// Generally the use is to load an endpoint or function into a specified div.  Will
// also accept '@' function callers or just '~' reload all j-views.
//
//
// Permalinks: If you have a permalink to some resource, frequently you'll want
// a button that, when clicked, copies the URL onto the clipboard.  This can be done
// with a j-permalink:
//
// <a href="https://example.com/permalink-url" class="j-permalink">Copy URL</a>
//
// <a> tags with the 'j-permalink' class will automatically copy the href onto the clipboard
// instead of executing the link. 

// Load views, buttons and forms into dictionary for routing.
function data_j(parent_selector, load_views=true) {
    
    // bind views
    if (load_views){
        refresh_views(parent_selector);
    }
    
    init_data_j(parent_selector);
    
    auto_nav(parent_selector); // if nav exists, set the active tab

    if (parent_selector) {
        //console.log("data-j binding complete on namespace:"+parent_selector);
    }
    else {
        //console.log("data-j binding complete at top level");
    }
}

// ==================
// = Initialization =
// ==================

// initializes data j environment
function init_data_j(parent_selector) {

    // bind the j-btn elements
    bind_buttons(parent_selector);
    
    // bind the ajax forms
    bind_forms(parent_selector);
    
    // bind navs
    bind_navs(parent_selector);
	
	// bind timers
	bind_timers(parent_selector);
	
	// bind permalinks
	bind_permalinks(parent_selector);
    
}


// =========================
// = Buttons (class j-btn) =
// =========================

// Main button binding router - decides what kind of binding function to use.
function bind_buttons(parent_selector) {
    // bind buttons
    const btn_selector = build_selector(parent_selector, '.j-btn');
    $(btn_selector).each(function(){
        const btn_id = $(this).attr('id');
        //console.log('Attempting to bind j-btn:'+btn_id);
		
		// check for browser exclusion - buttons can exclude themselves from specified
		// browsers with the 'data-exclude-ua' attribute.
		const excluded_ua = $(this).attr('data-exclude-ua');
		if (!exclude_for_browser(excluded_ua, btn_id)) {
	        // remove existing binding
	        $('#'+btn_id).off();
        
	        const j_data = parse_jdata($(this).attr("data-j"));
	        if ('@' in j_data) {
	            bind_function_caller_btn(btn_id, j_data);
	        }
	        else if ('*' in j_data) {
	            bind_endpoint_caller_btn(btn_id, j_data);
	        }
	        else if ('%' in j_data) {
	            bind_fader_btn(btn_id, j_data);
	        }
	        else if ('=' in j_data) {
	            bind_component_reload(btn_id, j_data);
	        }
		}
    });
}

// Binds button to a function caller
function bind_function_caller_btn(btn_id, j_data) {
    const btn = $('#'+btn_id);
    const target_function = j_data['@'];
    const target_args = parse_args(j_data[':']);
    const target_view = j_data['|'];
	const fader_target = j_data[';'];

    if ('~' in j_data) {
		if (';' in j_data) {
			btn.click(function(e){
				toggle_dropdown(btn_id);
				call_function(target_function, target_view, target_args);
				toggle_fade_on_target(fader_target);
				refresh_views();
				return false;
			})
		} else {
	        btn.click(function(e){
	            toggle_dropdown(btn_id);
	            call_function(target_function, target_view, target_args);
	            refresh_views();
	            return false;
	        });
		}
    }
    else {
		if (';' in j_data) {
			btn.click(function(e){
				toggle_dropdown(btn_id);
				call_function(target_function, target_view, target_args);
				toggle_fade_on_target(fader_target);
				return false;
			});
		} else {
	        btn.click(function(e){
	            toggle_dropdown(btn_id);
	            call_function(target_function, target_view, target_args);
	            return false;
	        });
		}
    }
}

// Binds button to an endpoint loader
function bind_endpoint_caller_btn(btn_id, j_data) {
    const btn = $('#'+btn_id);
    const target_endpoint = j_data['*'];
    const target_view = j_data['|'];
    const flash_msg = j_data['!'];
	const fader_target = j_data[';'];
    
    if ('~' in j_data) {
		if (';' in j_data) {
			btn.click(function(e){
				toggle_dropdown(btn_id);
				call_endpoint(target_endpoint, target_view, flash_msg, true);
				toggle_fade_on_target(fader_target);
				return false;
			});
		} else {
	        btn.click(function(e){
	            toggle_dropdown(btn_id);
	            call_endpoint(target_endpoint, target_view, flash_msg, true);
	            return false;
	        });
		}
    }
    else {
		if (';' in j_data) {
			btn.click(function(e){
				toggle_dropdown(btn_id);
				call_endpoint(target_endpoint, target_view, flash_msg);
				toggle_fade_on_target(fader_target);
				return false;
			});
		} else {
	        btn.click(function(e){
	            toggle_dropdown(btn_id);
	            call_endpoint(target_endpoint, target_view, flash_msg);
	            return false;
	        });
		}
    }
    //console.log("binding btn "+btn_id+" as endpoint caller")
}

// Binds button to a fader function
function bind_fader_btn(btn_id, j_data) {
    const btn = $('#'+btn_id);
    const target_element = j_data['%'];
    
    if ('~' in j_data) {
        btn.click(function(e){
            toggle_dropdown(btn_id);
            toggle_fade_on_target(target_element);
            refresh_views();
            return false;
        });
    }
    else {
        btn.click(function(e){
            toggle_dropdown(btn_id);
            toggle_fade_on_target(target_element);
            return false;
        });
    }
}

// Binds button to a component reloader
function bind_component_reload(btn_id, j_data) {
    const btn = $('#'+btn_id);
    const target_id = j_data['='];
    btn.click(function(e){
        toggle_dropdown(btn_id);
        reload_component(target_id);
        return false;
    });
}

// Ajax Forms
function bind_forms(parent_selector) {
    const form_selector = build_selector(parent_selector, '.j-form');
    $(form_selector).each(function(){        
        const j_data = parse_jdata($(this).attr('data-j'));
        build_ajax_form($(this).attr("id"), j_data);
    });
}

// Ajax form binding router - decides what functions to attach
function build_ajax_form(form_id, j_data) {
    //console.log("binding "+form_id+" as ajax form")
    
    if ('@' in j_data) {
        bind_form_preflight(form_id, j_data);
    }
    
    if ('+' in j_data) {
        bind_form_success_function(form_id, j_data);
    }
    else if ('*' in j_data) {
        bind_form_success_loader(form_id, j_data);
    }
    else if ('%' in j_data) {
        bind_form_success_fader(form_id, j_data);
    }
    else if ('=' in j_data) {
        bind_form_success_comp_reloader(form_id, j_data);
    }
    else {
        bind_simple_ajax_form(form_id, j_data);
    }
}

// binds a preflight function to the form (can co-exist with success functions)
function bind_form_preflight(form_id, j_data) {
    const target_form = $('#'+form_id);
    
    // clear existing submit listeners
    target_form.off("submit");
    
    if (':' in j_data) {
        target_form.submit(function(e){
            var target_args = parse_args(j_data[':']);
            return eval(j_data['@'])(...target_args)
        });
    }
    else {        
        target_form.submit(function(e){
            //console.log('calling preflight func:'+j_data['@']);
            return eval(j_data['@'])()
        });
    }
}

// Binds form to a success function caller
function bind_form_success_function(form_id, j_data) {
    // note - no args passed to success functions
    const target_function = j_data['+'];
    const target_args = parse_args(j_data[':']);
    const target_view = j_data['|'];
	const fader_target = j_data[';'];
    
    if ('~' in j_data) {
		if (';' in j_data) {
			$('#'+form_id.ajaxForm(function(data){
				target_args.push(data);
				call_function(target_function, target_view, target_args);
				toggle_fade_on_target(fader_target);
				data_j("", true); // rebind
			}));
		} else {
	        $('#'+form_id).ajaxForm(function(data){
	            //console.log('calling callback method:'+j_data['+']);
	            target_args.push(data);
	            call_function(target_function, target_view, target_args);
	            data_j("", true); // rebind
	        });
		}
    }
    else {
		if (';' in j_data) {
			$('#'+form_id).ajaxForm(function(data){
				target_args.push(data);
				call_function(target_function, target_view, target_args);
				toggle_fade_on_target(fader_target);
				data_j("", true);
			});
		} else {
	        $('#'+form_id).ajaxForm(function(data){
	            //console.log('calling callback method:'+j_data['+']);
	            target_args.push(data);
	            call_function(target_function, target_view, target_args);
	            data_j("", false); // rebind
	        });
		}
    }
}

// Binds form to a success endpoint loader
function bind_form_success_loader(form_id, j_data) {
    // create loader function on success
    const loader_path = j_data['*']
    const loader_target = j_data['|']
	const fader_target = j_data[';']
    
    if ('~' in j_data){
		if (';' in j_data) {
			$('#'+form_id).ajaxForm(function(data) {
				load_view_from_endpoint(loader_target, loader_path);
				toggle_fade_on_target(fader_target);
				refresh_views();
			});
		} else {
	        $('#'+form_id).ajaxForm(function(data){
	            load_view_from_endpoint(loader_target, loader_path);
	            // no need to rebind because called function runs rebind
	            refresh_views();
	        });
		}
    }
    else {
		if (';' in j_data) {
			$('#'+form_id).ajaxForm(function(data){
				load_view_from_endpoint(loader_target, loader_path);
				toggle_fade_on_target(fader_target);
			});
		} else {
	        $('#'+form_id).ajaxForm(function(data){
	            load_view_from_endpoint(loader_target, loader_path);
	            // no need to rebind because called function runs rebind
	        });
		}
    }
}

// Binds form to a success fader function
function bind_form_success_fader(form_id, j_data) {
    // make a fader on success
    const fader_target = j_data['%']
    
    if ('~' in j_data) {
        $('#'+form_id).ajaxForm(function(data){
            //console.log('calling toggle_fade_on_target on:'+fader_target)
            toggle_fade_on_target(fader_target);
            refresh_views();
            if ('!' in j_data) {
                flash(j_data['!']);
            }
        });
    }
    else {
        $('#'+form_id).ajaxForm(function(data){
            //console.log('calling toggle_fade_on_target on:'+fader_target)
            toggle_fade_on_target(fader_target);
            if ('!' in j_data) {
                flash(j_data['!']);
            }
        });
    }
}

// Binds form to a success component reloader
function bind_form_success_comp_reloader(form_id, j_data) {
    // reload a component on success
    const target_id = j_data['='];
    $('#'+form_id).ajaxForm(function(data){
        reload_component(target_id);
        if ('!' in j_data) {
            flash(j_data['!']);
        }
		if ('~' in j_data) {
			refresh_views();
		}
    });
}

// Makes an ajax form with no additional function bindings
function bind_simple_ajax_form(form_id, j_data) {
    $('#'+form_id).ajaxForm(function(data){
        data_j("", false); // rebind
    });
}


// Bind navs

function bind_navs(parent_selector) {
    const nav_selector = build_selector(parent_selector, '.j-nav');
    $(nav_selector).each(function(){
        const nav_id = $(this).attr('id');
        
        const navlink_selector = nav_selector+' .nav-link';
        $(navlink_selector).each(function(){
            const navlink_id = $(this).attr('id');
            const j_data = parse_jdata($(this).attr('data-j'));
            
            if ('@' in j_data) {
                bind_function_caller_nav(navlink_id, nav_id, j_data);
            }
            else if ('*' in j_data) {
                bind_endpoint_caller_nav(navlink_id, nav_id, j_data);
            }
        });
    });
}

function bind_function_caller_nav(navlink_id, nav_id, j_data) {
    const navlink = $('#'+navlink_id);
    const target_function = j_data['@'];
    const target_args = parse_args(j_data[':']);
    const target_view = j_data('|');
    
    navlink.off() // remove existing listeners
    
    if ('~' in j_data) {
        navlink.click(function(e){
            flip_nav(nav_id, navlink_id);
            call_function(target_function, target_view, target_args);
            refresh_views();
            return false;
        });
    }
    else {
        navlink.click(function(e){
            flip_nav(nav_id, navlink_id);
            call_function(target_function, target_view, target_args);
            return false;
        });
    }
}

function bind_endpoint_caller_nav(navlink_id, nav_id, j_data) {
    const navlink = $('#'+navlink_id);
    const target_endpoint = j_data['*'];
    const target_view = j_data['|'];
    
    navlink.off() // remove existing listeners
    
    if ('~' in j_data) {
        navlink.click(function(e){
            flip_nav(nav_id, navlink_id);
            call_endpoint(target_endpoint, target_view, null, true)
            return false;
        });
    }
    else {
        navlink.click(function(e){
            flip_nav(nav_id, navlink_id);
            call_endpoint(target_endpoint, target_view, null)
            return false;
        });
    }    
}

function flip_nav(nav_id, target_link_id) {
    const general_navlink_selector = '#'+nav_id+' .nav-link';
    $(general_navlink_selector).each(function(){
        $(this).removeClass('active');
    });
    $('#'+target_link_id).addClass('active');
    
    // if data-j-location has been set push it onto the location
    const tab_location = $('#'+target_link_id).attr('data-j-location');
    if (tab_location) {
        window.location.hash = '#'+tab_location;
    }
}

// if there is a nav with a tab whose location matches the location hash, make it the 
// active tab
function auto_nav() {
    // which tab is supposed to be active?
    const location_hash = window.location.hash.substring(1);
    
    if (location_hash) {
        // get the active tab
        const active_panel = $(".j-nav .nav-link.active").first();
        
        // if the active tab's location doesn't match the hash, find the tab with the
        // correct location and trigger it   
        if (active_panel && active_panel.attr('data-j-location') != location_hash) {
            $(".j-nav .nav-link[data-j-location='"+location_hash+"']").first().trigger("click");
        } 
    }
}

// Bind timers
function bind_timers(parent_selector) {
	const timer_selector = build_selector(parent_selector, '.j-timer');
	$(timer_selector).each(function(){
		const timer_id = $(this).attr('id');
		const raw_ctrl_string = $(this).attr('data-j');
		if (!raw_ctrl_string.includes(';')) {
			throw new Error("Timer control strings must be in format <seconds>;<ctrl-string>");
		}
		const ctrl_elements = raw_ctrl_string.split(';');
		const duration = ctrl_elements[0];
		const control_string = ctrl_elements[1];
		const j_data = parse_jdata(control_string);
		
		if ('@' in j_data) {
			bind_function_caller_timer(duration, j_data);
		} else if ('*' in j_data) {
			bind_endpoint_caller_timer(duration, j_data);
		} else if ('~' in j_data) {
			bind_view_refresh_timer(duration);
		}
	});
}

function bind_function_caller_timer(duration, j_data) {
	const duration_millis = duration * 1000;
    const target_function = j_data['@'];
    const target_args = parse_args(j_data[':']);
    const target_view = j_data('|');
	
	if ('~' in j_data) {
		window.setTimeout(
			function(){
				call_function(target_function, target_view, target_args);
				refresh_views();
			},
			duration_millis
		)
	}
	else {
		window.setTimeout(
			function(){
				call_function(target_function, target_view, target_args);
			},
			duration_millis
		)
	}
}

function bind_endpoint_caller_timer(duration, j_data) {
	const duration_millis = duration * 1000;
    const target_endpoint = j_data['*'];
    const target_view = j_data['|'];
	
	if ('~' in j_data) {
		window.setTimeout(
			function(){
				call_endpoint(target_endpoint, target_view, null, true);
			},
			duration_millis
		)
	} else {
		window.setTimeout(
			function(){
				call_endpoint(target_endpoint, target_view, null);
			},
			duration_millis
		)
	}
}

function bind_view_refresh_timer(duration) {
	const duration_millis = duration * 1000;
	
	window.setTimeout(
		function(){
			refresh_views();
		},
		duration_millis
	)
}


// ==============
// = Permalinks =
// ==============
function bind_permalinks(parent_selector) {
	const permalink_selector = build_selector(parent_selector, '.j-permalink');
	$(permalink_selector).each(function(){
		const permalink_id = $(this).attr('id');
		const permalink_url = $(this).attr('href');
		bind_permalink_copy(permalink_id, permalink_url);
	});
}


// binds the click event to a copy of the url onto the clipboard
function bind_permalink_copy(permalink_id, permalink_url) {
	const permalink = $('#'+permalink_id);
	permalink.off(); // get rid of existing listeners
	permalink.click(function(e){
		navigator.clipboard.writeText(permalink_url);
		flash("Link copied to clipboard");
		e.preventDefault();
		return false; // suppress default event
	});
}

// =======================
// = Execution Functions =
// =======================
// Called from bound events - executes the dynamic UI

// calls the specified function, takes the returned value and loads
// it into the target view as html - called from refresh_views
function load_view_from_function(target_id, specified_function, args) {
    if (args) {
        $('#'+target_id).html(eval(specified_function).apply(args));
    }
    else {
        $('#'+target_id).html(eval(specified_function).call());
    }
    data_j("", false); // rebind - don't load views
}

// loads the target div with the response from the specified endpoint
// called from refresh_views
function load_view_from_endpoint(target_id, endpoint) {
    $('#'+target_id).load(endpoint, function(){
        data_j("", false); // rebind - don't load views
    }).fadeIn();
}

// calls the specified function and loads it's return value into the view
function call_function(target_function, target_view, target_args) {
    //console.log("call_function with function: "+target_function+" view "+target_view+" args "+target_args);
    
    if (target_args) {
        if (target_view) {
            console.log("in call_function with target view and args");
            $('#'+target_view).html(eval(target_function)(...target_args)).fadeIn();
        }
        else {
            console.log("in call_function with target args but no view");
            eval(target_function)(...target_args);
        }
    }
    else {
        if (target_view) {
            console.log("in call_function with target view but no args")
            $('#'+target_view).html(eval(target_function)()).fadeIn();
        }
        else {
            console.log("in call_function with no view and no args");
            eval(target_function)();
        }
    }
    data_j("", false); // rebind
}

// calls the specified endpoint and loads its response into the target view
function call_endpoint(target_endpoint, target_view, flash_msg, refresh=false) {
    if (flash_msg) {
        flash(flash_msg);
    }
    
    if (target_view) {
        $('#'+target_view).load(target_endpoint, function(){
            data_j("", refresh); // rebind
        }).fadeIn();
    }
    else {
        // no target
        if (refresh) {
            $.get(target_endpoint, function(){
                refresh_views();
            });
        }
        else {
            $.get(target_endpoint);
        }
    }
}

// toggles visibility on the target
function toggle_fade_on_target(target_selector) {
    console.log("Calling toggle fade on target: "+target_selector);
    var target_element;
    if (target_selector.charAt(0) == '^') {
        // the parent should be targeted
        target_parent = true;
        var selector = target_selector.substr(1, target_selector.length);
        return $(selector).parent().fadeToggle();
    }
    else {
        $(target_selector).fadeToggle();
    }
}

// refreshes the j-views
function refresh_views(parent_selector) {
    const view_selector = build_selector(parent_selector, '.j-view');
    $(view_selector).each(function(){
        const j_data = parse_jdata($(this).attr('data-j'));
    
        // look for a view specified and call initial loader function - should
        // populate the target div immediately
        if ('@' in j_data) {
            var args = []
            if (':' in j_data) {
                args = parse_args(j_data[':'])
            }
            load_view_from_function($(this).attr('id'), j_data['@'], args);
        } else if ('*' in j_data) {
            load_view_from_endpoint($(this).attr('id'), j_data['*']);
        }
    });
}

// waits and then calls refresh views
function delay_refresh_views(delay_time) {
    setTimeout(function(){
        refresh_views();
    }, delay_time);
}

// reloads the specified j-comp.  data-j should be the reload path
function reload_component(comp_id) {
    console.log("reload comp, comp id is: "+comp_id);
    $('#'+comp_id).load($('#'+comp_id).attr("data-j"), function(){
        data_j("", false);
    });
}

// =============
// = Utilities =
// =============

// Parses j-data string, returns dictionary of values.
// @ defines a function call, or a presubmit function for a form
// + defines a function called on return
// | defines a view target for returned data
// * defines an initial endpoint to load as a view: e.g. */tasks/all/
// : defines an argument to be passed to a function. Multiple args are comma delimited
// % defines a fader function, will toggle the fade the target
// ! defines a flash message

function parse_jdata(inputString) {
  const separators = ['@', '+', '|', '*', ':', '%', '!', '~', '=', ';'];

  if (!separators.includes(inputString[0])) {
    throw new Error('J-data string must start with a valid control character: @ + | * : % ! ~ = ;');
  }

  const result = {};
  let currentSeparator = inputString[0];
  let currentWord = '';

  for (let i = 1; i < inputString.length; i++) {
    if (separators.includes(inputString[i])) {
      result[currentSeparator] = currentWord;
      currentSeparator = inputString[i];
      currentWord = '';
    } else {
      currentWord += inputString[i];
    }
  }

  result[currentSeparator] = currentWord;

  return result;
}

// if the parent exists, builds a compound selector
function build_selector(parent_selector, child_selector) {
    if (parent_selector) {
        return parent_selector+' '+child_selector;
    }
    else {
        return child_selector;
    }
}

// parses arg list, returns array
function parse_args(arg_string) {
    if (arg_string) {
        return arg_string.split(',');
    }
    else {
        return [];
    }
}

// Utility - flash a message
// fades the alert in with the message, then fades out. Requires a div with id 'flash'
function flash(message) {
    $('#flash').empty().text(message).fadeIn(function(){
        $('#flash').delay(2000).fadeOut()
    });
}

// utility - scrolls to specified anchor
function scrollToAnchor(aid){
    var aTag = $("a[name='"+ aid +"']");
    $('html,body').animate({scrollTop: aTag.offset().top},'fast');
}

// toggle dropdown
function toggle_dropdown(item_id) {
    const possible_dropdown = $('#'+item_id).parent().parent().parent();
    if (possible_dropdown.hasClass('dropdown')) {
        possible_dropdown.dropdown('toggle');
    }
}

function is_browser(name) {
    const ua = navigator.userAgent.toLowerCase();
    name = name.toLowerCase();

    if (name === "safari") {
        return ua.includes("safari") && !ua.includes("chrome") && !ua.includes("crios") && !ua.includes("fxios");
    }

    return ua.includes(name);
}

// hides the element for the specified browser
function exclude_for_browser(browser, element_id) {
	if (browser && is_browser(browser)) {
		$('#'+element_id).hide();
		return true;
	} else {
		return false;
	}
}