(function() {
    var htmlTags, key, lookup, selfClosers, _i, _len, _ref;
    selfClosers = {};
    _ref = "br,img,hr,link,source,input,meta,col,frame,base,area".split(",");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        selfClosers[key] = true
    }
    htmlTags = {head: {_tags: {title: {},link: {rel: ["stylesheet", "alternate", "icon"],href: function() {
                        var file, _j, _len1, _ref1, _results;
                        _ref1 = design.bundles["public"].files_as_array;
                        _results = [];
                        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                            file = _ref1[_j];
                            if (file.isStyleSheet()) {
                                _results.push(file.path)
                            }
                        }
                        return _results
                    }},script: {src: [],type: ["text/javascript"]},style: {type: ["text/css"]},meta: {name: ["description", "authors"],content: [],charset: ["UTF-8"]}}},body: {},a: {href: [],target: ["_blank", "_top"]},p: {},ul: {},ol: {},li: {},dl: {},dt: {},dd: {},img: {src: [],alt: [],width: [],height: [],draggable: ["true", "false"]},div: {},span: {},blockquote: {},pre: {},code: {},strong: {},small: {},input: {type: ["text", "email", "url", "password", "hidden", "checkbox", "radio", "submit", "button", "reset", "image", "file"],name: [],value: [],maxlength: [],placeholder: [],autofocus: ["autofocus"],readonly: ["readonly"],required: ["required"],disabled: ["disabled"],checked: ["checked"]},textarea: {name: [],placeholder: [],autofocus: ["autofocus"],readonly: ["readonly"],required: ["required"],disabled: ["disabled"],cols: [],rows: []},select: {name: [],size: [],multiple: ["multiple"],disabled: ["disabled"],readonly: ["readonly"],_tags: {option: {value: [],selected: ["selected"]},optgroup: {label: []}}},video: {width: [],height: [],controls: ["controls"],_tags: {source: {src: [],type: ["video/ogg", "video/mp4", "video/webm"]}}},audio: {controls: ["controls"],_tags: {source: {src: [],type: ["audio/ogg", "audio/mpeg"]}}},source: {src: [],type: ["audio/ogg", "audio/mpeg", "video/ogg", "video/mp4", "video/webm"]},canvas: {height: [],width: [],},command: {checked: ["checked"],type: ["command", "checkbox", "radio"],label: [],icon: [],disabled: ["disabled"],radiogroup: []},details: {open: ["open"],},embed: {height: [],width: [],src: [],type: ["application", "audio", "example", "image", "message", "model", "multipart", "text", "video"]},meter: {value: [],min: [],max: [],form: [],high: [],low: [],optimum: [],value: []},progress: {max: [],value: []},time: {datetime: [],pubdate: []},output: {for: [],form: [],name: [],},datalist: {_tags: {option: {value: [],selected: ["selected"]}}},keygen: {autofocus: ["autofocus"],challenge: ["challenge"],disabled: ["disabled"],form: [],keytype: ["rsa", "dsa", "ec"],name: []},figure: {_tags: {figcaption: {}}},form: {method: ["post", "get"],action: [],_tags: {label: {"for": []},input: {type: ["text", "email", "url", "password", "hidden", "checkbox", "radio", "submit", "button", "reset", "image", "file"],name: [],value: [],maxlength: [],placeholder: [],autofocus: ["autofocus"],readonly: ["readonly"],required: ["required"],disabled: ["disabled"],checked: ["checked"]},textarea: {name: [],placeholder: [],autofocus: ["autofocus"],readonly: ["readonly"],required: ["required"],disabled: ["disabled"],cols: [],rows: []},select: {name: [],size: [],multiple: ["multiple"],disabled: ["disabled"],readonly: ["readonly"],_tags: {option: {value: [],selected: ["selected"]},optgroup: {label: []}}},button: {},legend: {},fieldset: {}}},table: {border: ["1"],cellspacing: [],cellpadding: [],align: ["left", "center", "right"],width: []},tr: {},td: {},th: {},caption: {},thead: {},tbody: {},tfoot: {}};
    lookup = function(obj, prefix, callback) {
        var _results;
        _results = [];
        for (key in obj) {
            if (key.indexOf("_") !== 0 && (prefix === "" || key.indexOf(prefix) === 0)) {
                if (callback) {
                    _results.push(callback(key))
                } else {
                    _results.push(key)
                }
            }
        }
        return _results
    };
    window.HtmlCompletion = (function() {
        function HtmlCompletion() {
            this.cssCompletion || (this.cssCompletion = new CssCompletion({local: true}))
        }
        HtmlCompletion.prototype.hasHints = function(editor) {
            var cursor, token;
            cursor = editor.getCursor();
            token = editor.getTokenAt(cursor);
            if (token.state.mode === "css") {
                return true
            }
            if (!(token.state.htmlState && token.state.htmlState.inTag && token.state.htmlState.tagName)) {
                return false
            }
            if (token.state.htmlState.type === "openTag" && token.string.length < 3 && token.string.indexOf("<") === 0) {
                return false
            }
            return true
        };
        HtmlCompletion.prototype.getRootTags = function(string) {
            return htmlTags
        };
        HtmlCompletion.prototype.getContextualTags = function(token, outerTags, closest) {
            var cur, index, tag, tags;
            if (closest == null) {
                closest = -1
            }
            cur = token.state.htmlState.context;
            index = 0;
            while (cur) {
                tag = outerTags[cur.tagName];
                if (tag && tag.call) {
                    tag = tag()
                }
                tags = tag && tag._tags;
                if (tags && tags.call) {
                    tags = tags(token)
                }
                if (tags && (closest < 0 || index < closest)) {
                    return this.getContextualTags(token, tags, index)
                }
                cur = cur.prev;
                index++
            }
            return outerTags
        };
        HtmlCompletion.prototype.getTagCompletions = function(token) {
            var openTag, results, skip, string, tags, type;
            type = token.state.htmlState.type;
            skip = type === "openTag" ? 1 : 2;
            this.state.getString = function(token) {
                return token.string.substr(skip, token.string.length)
            };
            if (type === "closeTag") {
                openTag = token.state.htmlState.context.tagName;
                return [{value: "</" + openTag + ">",label: openTag}]
            }
            string = this.state.getString(token);
            tags = this.getContextualTags(token, this.getRootTags(string));
            return results = lookup(tags, string, function(result) {
                return {value: "<" + result,label: result}
            })
        };
        HtmlCompletion.prototype.getAttributeCompletions = function(token) {
            var attr, attrs, currentAttrs, tag, tagName, _j, _len1, _results;
            tagName = token.state.htmlState.tagName;
            tag = this.getContextualTags(token, this.getRootTags(tagName))[tagName];
            if (!tag) {
                return []
            }
            if (tag.call) {
                tag = tag()
            }
            currentAttrs = token.state.htmlState.attrs || {};
            attrs = lookup(tag, token.string, function(result) {
                return {value: result,action: 'insertAttribute'}
            });
            if (tagName.indexOf("po") !== 0) {
                attrs.push({value: "class",action: 'insertAttribute'});
                attrs.push({value: "id",action: 'insertAttribute'})
            }
            _results = [];
            for (_j = 0, _len1 = attrs.length; _j < _len1; _j++) {
                attr = attrs[_j];
                if (!currentAttrs[attr.value]) {
                    _results.push(attr)
                }
            }
            return _results
        };
        HtmlCompletion.prototype.insertAttribute = function(editor, selected) {
            var cursor, from, to, token;
            cursor = editor.getCursor();
            token = editor.getTokenAt(cursor);
            if (/^\s+$/.test(token.string)) {
                token = $.extend({}, token, {start: cursor.ch,end: cursor.ch,string: ""})
            }
            from = {line: cursor.line,ch: token.start};
            to = {line: cursor.line,ch: token.end};
            editor.replaceRange("" + selected + "=\"\"", from, to);
            cursor = editor.getCursor();
            return editor.setCursor(cursor.line, cursor.ch - 1)
        };
        HtmlCompletion.prototype.insertRule = function(editor, selected) {
            return this.cssCompletion.insertRule(editor, selected)
        };
        HtmlCompletion.prototype.getAttributeValueCompletions = function(token, editor, cursor) {
            var attr, attrToken, list, string, tag, tagName, _j, _len1, _results;
            tagName = token.state.htmlState.tagName;
            tag = this.getContextualTags(token, this.getRootTags(tagName))[tagName];
            if (!tag) {
                return []
            }
            if (tag.call) {
                tag = tag()
            }
            attrToken = editor.getTokenAt({line: cursor.line,ch: token.start - 1});
            list = tag[attrToken.string] || [];
            if (list.call) {
                list = list(token)
            }
            this.state.getString = function(token) {
                return token.string.replace(/(^["']|["']$)/g, '')
            };
            string = this.state.getString(token);
            _results = [];
            for (_j = 0, _len1 = list.length; _j < _len1; _j++) {
                attr = list[_j];
                if (string === "" || attr.indexOf(string) === 0) {
                    _results.push({value: "\"" + attr + "\"",label: attr})
                }
            }
            return _results
        };
        HtmlCompletion.prototype.getCompletions = function(token, editor, cursor) {
            if (token.className && token.string.indexOf("<") === 0) {
                return this.getTagCompletions(token)
            } else if (token.state.htmlState && token.state.htmlState.tagName && token.state.htmlState.type !== "closeTag") {
                if (token.className === null || token.className.match(/attribute/)) {
                    return this.getAttributeCompletions(token)
                } else if (token.className && token.className.indexOf("string") > -1) {
                    return this.getAttributeValueCompletions(token, editor, cursor)
                }
            }
        };
        HtmlCompletion.prototype.getHints = function(editor) {
            var cursor, string, suggestion, token;
            cursor = editor.getCursor();
            token = editor.getTokenAt(cursor);
            if (!(this.state && this.state.line === cursor.line && this.state.start === token.start && this.state.end === token.end - 1)) {
                this.state = {line: cursor.line,start: token.start}
            }
            this.state.end = token.end;
            switch (token.state.mode) {
                case "html":
                    if (/^\s+$/.test(token.string)) {
                        token = $.extend({}, token, {start: cursor.ch,end: cursor.ch,string: ""})
                    }
                    if (this.state.suggestions) {
                        string = this.state.getString ? this.state.getString(token) : token.string;
                        this.state.suggestions = (function() {
                            var _j, _len1, _ref1, _results;
                            _ref1 = this.state.suggestions;
                            _results = [];
                            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                                suggestion = _ref1[_j];
                                if (suggestion.label.indexOf(string) === 0) {
                                    _results.push(suggestion)
                                }
                            }
                            return _results
                        }).call(this)
                    } else {
                        this.state.suggestions = this.getCompletions(token, editor, cursor)
                    }
                    if (this.state.suggestions && this.state.suggestions.length === 1 && this.state.suggestions[0].value === token.string) {
                        return null
                    }
                    return {list: this.state.suggestions,from: {line: cursor.line,ch: token.start},to: {line: cursor.line,ch: token.end}};
                case "css":
                    return this.cssCompletion.getHints(editor)
            }
        };
        HtmlCompletion.prototype.autoAttribute = function(editor, event) {
            var cursor, token;
            cursor = editor.getCursor();
            token = editor.getTokenAt(cursor);
            if (token.className && token.className.indexOf("attribute") > -1) {
                event.stop();
                editor.replaceRange('=""', cursor);
                return editor.setCursor(cursor.line, cursor.ch + 2)
            }
        };
        HtmlCompletion.prototype.autoCloseTag = function(editor, event, ch) {
            var cursor, end, nextChar, nextToken, tagName, token;
            cursor = editor.getCursor();
            token = editor.getTokenAt(cursor);
            if (token.className && token.className.indexOf("string") > -1 && cursor.ch !== token.end) {
                return
            }
            if (token.className && token.className.indexOf("attribute") > -1) {
                return
            }
            nextChar = editor.getRange(cursor, {line: cursor.line,ch: cursor.ch + 1});
            if (nextChar === ">") {
                event.stop();
                editor.setCursor(cursor.line, cursor.ch + 1)
            }
            if (!nextChar.match(/^\s?$/)) {
                return
            }
            tagName = token.state.htmlState && token.state.htmlState.tagName;
            if (selfClosers[tagName]) {
                event.stop();
                editor.replaceRange("/>", cursor);
                return editor.setCursor(cursor.line, cursor.ch + 2)
            } else if (tagName && token.string.match(/[^>\/]$/)) {
                event.stop();
                nextToken = editor.getTokenAt({line: cursor.line,ch: cursor.ch + 1});
                if (nextToken.state.htmlState && nextToken.state.htmlState.tagName && nextToken.string.match(/^\/?>$/)) {
                    end = {line: cursor.line,ch: nextToken.end}
                } else {
                    end = cursor
                }
                if (end.ch === cursor.ch && token.state.htmlState.type !== "closeTag") {
                    editor.replaceRange("></" + tagName + ">", cursor, end)
                } else {
                    editor.replaceRange(">", cursor, end)
                }
                return editor.setCursor(cursor.line, cursor.ch + 1)
            }
        };
        HtmlCompletion.prototype.autoInsertions = function(editor, event) {
            switch (event.charCode) {
                case 61:
                    return this.autoAttribute(editor, event);
                case 62:
                    return this.autoCloseTag(editor, event, '>')
            }
        };
        HtmlCompletion.prototype.newline = function(editor, event) {
            var cursor, nextToken, token;
            cursor = editor.getCursor();
            token = editor.getTokenAt(cursor);
            if (token.className && token.className.indexOf("tag") > -1 && token.string === ">") {
                nextToken = editor.getTokenAt({line: cursor.line,ch: cursor.ch + 1});
                if (nextToken.className && nextToken.className.indexOf("tag") > -1) {
                    if (nextToken.state.htmlState.tagName === token.state.htmlState.tagName) {
                        if (token.state.htmlState.type === "endTag" && nextToken.state.htmlState.type === "closeTag") {
                            event.stop();
                            editor.operation(function() {
                                var i, _j, _ref1, _ref2, _results;
                                editor.replaceRange("\n\n", cursor);
                                editor.setCursor(cursor.line + 1, cursor.ch + 2);
                                _results = [];
                                for (i = _j = _ref1 = cursor.line, _ref2 = cursor.line + 2; _ref1 <= _ref2 ? _j <= _ref2 : _j >= _ref2; i = _ref1 <= _ref2 ? ++_j : --_j) {
                                    _results.push(editor.indentLine(i))
                                }
                                return _results
                            });
                            return true
                        }
                    }
                }
            }
            return false
        };
        return HtmlCompletion
    })()
}).call(this);
