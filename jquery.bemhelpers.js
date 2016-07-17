/**
 * jQuery plugin for basic BEM manipulations.
 *
 * @author Max Shirshin
 * @version 2.2.1
 *
 * @thanks K. for the inspiration <3
 *
 */
(function($, undefined) {

    var BEMsyntax = {
            elem: '__',
            modBefore: '_',
            modKeyVal: '_'
        },
        getEventPattern = function(block, elem, modName, modVal) {
            return block + (elem !== undefined ? BEMsyntax.elem + elem : '') +
                BEMsyntax.modBefore + modName + BEMsyntax.modKeyVal +
                (typeof modVal === 'boolean' ? '*' : (modVal || '*'));
        },
        getElemClasses = function(domEl) {
            if (domEl.classList) {
                return $.makeArray(domEl.classList);
            } else {
                return $.trim(domEl.className).split(/\s+/);
            }
        };

    $.BEMsyntax = function(props) {
        if (typeof props !== 'object') props = {};

        for (var prop in props) {
            if (props.hasOwnProperty(prop) && BEMsyntax.hasOwnProperty(prop)) {
                BEMsyntax[prop] = props[prop];
            }
        }

        return $.extend({}, BEMsyntax);
    };

    $.extend($.fn, {
        getMod: function(block, elem, modName) {
            if (modName === undefined) {
                modName = elem;
                elem = undefined;
            }

            if (this.length) {
                var classPattern = block + (elem !== undefined ? BEMsyntax.elem + elem : '') +
                        BEMsyntax.modBefore + modName,
                    modVal = false;

                $.each(getElemClasses(this.get(0)), function(i, c) {
                    if (c === classPattern) {
                        modVal = true;
                        return false;
                    } else if (c.indexOf(classPattern) === 0
                        && c.substr(classPattern.length, BEMsyntax.modKeyVal.length) === BEMsyntax.modKeyVal) {

                        modVal = c.substr(classPattern.length + BEMsyntax.modKeyVal.length);
                        return false;
                    }
                });

                return modVal;

            } else return undefined;
        },

        setMod: function(block, elem, modName, modVal) {
            if (modVal === undefined) {
                modVal = modName;
                modName = elem;
                elem = undefined;
            }

            return this.each(function() {
                var $this = $(this),
                    classPattern = block + (elem !== undefined ? BEMsyntax.elem + elem : '') +
                        BEMsyntax.modBefore + modName;

                var removeTheAlreadySetValue = false;

                if (modVal === false) {
                    $this.removeClass(classPattern);
                } else if (modVal === true) {
                    $this.addClass(classPattern);
                } else {
                    // if the String modifer value is an empty String, then it means that user likes to remove it. So set 'removeTheAlreadySetValue' to true.
                    if (modVal === '') removeTheAlreadySetValue = true;

                    $.each(getElemClasses(this), function(i, c) {
                        if (c.indexOf(classPattern) === 0
                            && c.substr(classPattern.length, BEMsyntax.modKeyVal.length) === BEMsyntax.modKeyVal) {

                            $this.removeClass(c);
                        }
                    });

                    // Check whether we should remove the modifer class or not according to 'removeTheAlreadySetValue'
                    if (removeTheAlreadySetValue === true) $this.removeClass(classPattern + BEMsyntax.modKeyVal + modVal);
                    else $this.addClass(classPattern + BEMsyntax.modKeyVal + modVal);
                }

                // if we're dealing with a String modifer(ONLY if we're dealing with a String modifer 'removeTheAlreadySetValue' may be true) and 'removeTheAlreadySetValue' is true, then it means that user aims to remove the already existing modifier value class.
                if (removeTheAlreadySetValue === true) modVal = false;

                // after the modifier is set, run the corresponding custom event
                var args = {
                    block: block,
                    elem: elem,
                    modName: modName,
                    modVal: modVal
                };

                // trigger the wildcard event pattern first
                $this.trigger('setMod:' + getEventPattern(block, elem, modName), args);
                // for boolean modifiers, one can only use the wildcard pattern,
                // so no need to trigger the same event twice
                if (typeof modVal !== 'boolean') {
                    $this.trigger('setMod:' + getEventPattern(block, elem, modName, modVal), args);
                }
            });
        },

        hasMod: function(block, elem, modName) {
            return !! this.getMod(block, elem, modName);
        }
    });

})(jQuery);
