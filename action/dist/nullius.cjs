#!/usr/bin/env node
var __nullius_import_meta_url = require('node:url').pathToFileURL(__filename).href;
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/error.js
var require_error = __commonJS({
  "../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/error.js"(exports2) {
    var CommanderError2 = class extends Error {
      /**
       * Constructs the CommanderError class
       * @param {number} exitCode suggested exit code which could be used with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       */
      constructor(exitCode, code, message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = code;
        this.exitCode = exitCode;
        this.nestedError = void 0;
      }
    };
    var InvalidArgumentError2 = class extends CommanderError2 {
      /**
       * Constructs the InvalidArgumentError class
       * @param {string} [message] explanation of why argument is invalid
       */
      constructor(message) {
        super(1, "commander.invalidArgument", message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
      }
    };
    exports2.CommanderError = CommanderError2;
    exports2.InvalidArgumentError = InvalidArgumentError2;
  }
});

// ../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/argument.js
var require_argument = __commonJS({
  "../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/argument.js"(exports2) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Argument2 = class {
      /**
       * Initialize a new command argument with the given name and description.
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @param {string} name
       * @param {string} [description]
       */
      constructor(name, description) {
        this.description = description || "";
        this.variadic = false;
        this.parseArg = void 0;
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.argChoices = void 0;
        switch (name[0]) {
          case "<":
            this.required = true;
            this._name = name.slice(1, -1);
            break;
          case "[":
            this.required = false;
            this._name = name.slice(1, -1);
            break;
          default:
            this.required = true;
            this._name = name;
            break;
        }
        if (this._name.length > 3 && this._name.slice(-3) === "...") {
          this.variadic = true;
          this._name = this._name.slice(0, -3);
        }
      }
      /**
       * Return argument name.
       *
       * @return {string}
       */
      name() {
        return this._name;
      }
      /**
       * @package
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Argument}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Set the custom handler for processing CLI command arguments into argument values.
       *
       * @param {Function} [fn]
       * @return {Argument}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Only allow argument value to be one of choices.
       *
       * @param {string[]} values
       * @return {Argument}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Make argument required.
       *
       * @returns {Argument}
       */
      argRequired() {
        this.required = true;
        return this;
      }
      /**
       * Make argument optional.
       *
       * @returns {Argument}
       */
      argOptional() {
        this.required = false;
        return this;
      }
    };
    function humanReadableArgName(arg) {
      const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
      return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
    }
    exports2.Argument = Argument2;
    exports2.humanReadableArgName = humanReadableArgName;
  }
});

// ../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/help.js
var require_help = __commonJS({
  "../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/help.js"(exports2) {
    var { humanReadableArgName } = require_argument();
    var Help2 = class {
      constructor() {
        this.helpWidth = void 0;
        this.sortSubcommands = false;
        this.sortOptions = false;
        this.showGlobalOptions = false;
      }
      /**
       * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
       *
       * @param {Command} cmd
       * @returns {Command[]}
       */
      visibleCommands(cmd) {
        const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
        const helpCommand = cmd._getHelpCommand();
        if (helpCommand && !helpCommand._hidden) {
          visibleCommands.push(helpCommand);
        }
        if (this.sortSubcommands) {
          visibleCommands.sort((a, b) => {
            return a.name().localeCompare(b.name());
          });
        }
        return visibleCommands;
      }
      /**
       * Compare options for sort.
       *
       * @param {Option} a
       * @param {Option} b
       * @returns {number}
       */
      compareOptions(a, b) {
        const getSortKey = (option) => {
          return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
        };
        return getSortKey(a).localeCompare(getSortKey(b));
      }
      /**
       * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleOptions(cmd) {
        const visibleOptions = cmd.options.filter((option) => !option.hidden);
        const helpOption = cmd._getHelpOption();
        if (helpOption && !helpOption.hidden) {
          const removeShort = helpOption.short && cmd._findOption(helpOption.short);
          const removeLong = helpOption.long && cmd._findOption(helpOption.long);
          if (!removeShort && !removeLong) {
            visibleOptions.push(helpOption);
          } else if (helpOption.long && !removeLong) {
            visibleOptions.push(
              cmd.createOption(helpOption.long, helpOption.description)
            );
          } else if (helpOption.short && !removeShort) {
            visibleOptions.push(
              cmd.createOption(helpOption.short, helpOption.description)
            );
          }
        }
        if (this.sortOptions) {
          visibleOptions.sort(this.compareOptions);
        }
        return visibleOptions;
      }
      /**
       * Get an array of the visible global options. (Not including help.)
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleGlobalOptions(cmd) {
        if (!this.showGlobalOptions) return [];
        const globalOptions = [];
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          const visibleOptions = ancestorCmd.options.filter(
            (option) => !option.hidden
          );
          globalOptions.push(...visibleOptions);
        }
        if (this.sortOptions) {
          globalOptions.sort(this.compareOptions);
        }
        return globalOptions;
      }
      /**
       * Get an array of the arguments if any have a description.
       *
       * @param {Command} cmd
       * @returns {Argument[]}
       */
      visibleArguments(cmd) {
        if (cmd._argsDescription) {
          cmd.registeredArguments.forEach((argument) => {
            argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
          });
        }
        if (cmd.registeredArguments.find((argument) => argument.description)) {
          return cmd.registeredArguments;
        }
        return [];
      }
      /**
       * Get the command term to show in the list of subcommands.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandTerm(cmd) {
        const args = cmd.registeredArguments.map((arg) => humanReadableArgName(arg)).join(" ");
        return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + // simplistic check for non-help option
        (args ? " " + args : "");
      }
      /**
       * Get the option term to show in the list of options.
       *
       * @param {Option} option
       * @returns {string}
       */
      optionTerm(option) {
        return option.flags;
      }
      /**
       * Get the argument term to show in the list of arguments.
       *
       * @param {Argument} argument
       * @returns {string}
       */
      argumentTerm(argument) {
        return argument.name();
      }
      /**
       * Get the longest command term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestSubcommandTermLength(cmd, helper) {
        return helper.visibleCommands(cmd).reduce((max, command) => {
          return Math.max(max, helper.subcommandTerm(command).length);
        }, 0);
      }
      /**
       * Get the longest option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestOptionTermLength(cmd, helper) {
        return helper.visibleOptions(cmd).reduce((max, option) => {
          return Math.max(max, helper.optionTerm(option).length);
        }, 0);
      }
      /**
       * Get the longest global option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestGlobalOptionTermLength(cmd, helper) {
        return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
          return Math.max(max, helper.optionTerm(option).length);
        }, 0);
      }
      /**
       * Get the longest argument term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestArgumentTermLength(cmd, helper) {
        return helper.visibleArguments(cmd).reduce((max, argument) => {
          return Math.max(max, helper.argumentTerm(argument).length);
        }, 0);
      }
      /**
       * Get the command usage to be displayed at the top of the built-in help.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandUsage(cmd) {
        let cmdName = cmd._name;
        if (cmd._aliases[0]) {
          cmdName = cmdName + "|" + cmd._aliases[0];
        }
        let ancestorCmdNames = "";
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          ancestorCmdNames = ancestorCmd.name() + " " + ancestorCmdNames;
        }
        return ancestorCmdNames + cmdName + " " + cmd.usage();
      }
      /**
       * Get the description for the command.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandDescription(cmd) {
        return cmd.description();
      }
      /**
       * Get the subcommand summary to show in the list of subcommands.
       * (Fallback to description for backwards compatibility.)
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandDescription(cmd) {
        return cmd.summary() || cmd.description();
      }
      /**
       * Get the option description to show in the list of options.
       *
       * @param {Option} option
       * @return {string}
       */
      optionDescription(option) {
        const extraInfo = [];
        if (option.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (option.defaultValue !== void 0) {
          const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
          if (showDefault) {
            extraInfo.push(
              `default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`
            );
          }
        }
        if (option.presetArg !== void 0 && option.optional) {
          extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
        }
        if (option.envVar !== void 0) {
          extraInfo.push(`env: ${option.envVar}`);
        }
        if (extraInfo.length > 0) {
          return `${option.description} (${extraInfo.join(", ")})`;
        }
        return option.description;
      }
      /**
       * Get the argument description to show in the list of arguments.
       *
       * @param {Argument} argument
       * @return {string}
       */
      argumentDescription(argument) {
        const extraInfo = [];
        if (argument.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (argument.defaultValue !== void 0) {
          extraInfo.push(
            `default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`
          );
        }
        if (extraInfo.length > 0) {
          const extraDescripton = `(${extraInfo.join(", ")})`;
          if (argument.description) {
            return `${argument.description} ${extraDescripton}`;
          }
          return extraDescripton;
        }
        return argument.description;
      }
      /**
       * Generate the built-in help text.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {string}
       */
      formatHelp(cmd, helper) {
        const termWidth = helper.padWidth(cmd, helper);
        const helpWidth = helper.helpWidth || 80;
        const itemIndentWidth = 2;
        const itemSeparatorWidth = 2;
        function formatItem(term, description) {
          if (description) {
            const fullText = `${term.padEnd(termWidth + itemSeparatorWidth)}${description}`;
            return helper.wrap(
              fullText,
              helpWidth - itemIndentWidth,
              termWidth + itemSeparatorWidth
            );
          }
          return term;
        }
        function formatList(textArray) {
          return textArray.join("\n").replace(/^/gm, " ".repeat(itemIndentWidth));
        }
        let output = [`Usage: ${helper.commandUsage(cmd)}`, ""];
        const commandDescription = helper.commandDescription(cmd);
        if (commandDescription.length > 0) {
          output = output.concat([
            helper.wrap(commandDescription, helpWidth, 0),
            ""
          ]);
        }
        const argumentList = helper.visibleArguments(cmd).map((argument) => {
          return formatItem(
            helper.argumentTerm(argument),
            helper.argumentDescription(argument)
          );
        });
        if (argumentList.length > 0) {
          output = output.concat(["Arguments:", formatList(argumentList), ""]);
        }
        const optionList = helper.visibleOptions(cmd).map((option) => {
          return formatItem(
            helper.optionTerm(option),
            helper.optionDescription(option)
          );
        });
        if (optionList.length > 0) {
          output = output.concat(["Options:", formatList(optionList), ""]);
        }
        if (this.showGlobalOptions) {
          const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
            return formatItem(
              helper.optionTerm(option),
              helper.optionDescription(option)
            );
          });
          if (globalOptionList.length > 0) {
            output = output.concat([
              "Global Options:",
              formatList(globalOptionList),
              ""
            ]);
          }
        }
        const commandList = helper.visibleCommands(cmd).map((cmd2) => {
          return formatItem(
            helper.subcommandTerm(cmd2),
            helper.subcommandDescription(cmd2)
          );
        });
        if (commandList.length > 0) {
          output = output.concat(["Commands:", formatList(commandList), ""]);
        }
        return output.join("\n");
      }
      /**
       * Calculate the pad width from the maximum term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      padWidth(cmd, helper) {
        return Math.max(
          helper.longestOptionTermLength(cmd, helper),
          helper.longestGlobalOptionTermLength(cmd, helper),
          helper.longestSubcommandTermLength(cmd, helper),
          helper.longestArgumentTermLength(cmd, helper)
        );
      }
      /**
       * Wrap the given string to width characters per line, with lines after the first indented.
       * Do not wrap if insufficient room for wrapping (minColumnWidth), or string is manually formatted.
       *
       * @param {string} str
       * @param {number} width
       * @param {number} indent
       * @param {number} [minColumnWidth=40]
       * @return {string}
       *
       */
      wrap(str, width, indent, minColumnWidth = 40) {
        const indents = " \\f\\t\\v\xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF";
        const manualIndent = new RegExp(`[\\n][${indents}]+`);
        if (str.match(manualIndent)) return str;
        const columnWidth = width - indent;
        if (columnWidth < minColumnWidth) return str;
        const leadingStr = str.slice(0, indent);
        const columnText = str.slice(indent).replace("\r\n", "\n");
        const indentString = " ".repeat(indent);
        const zeroWidthSpace = "\u200B";
        const breaks = `\\s${zeroWidthSpace}`;
        const regex = new RegExp(
          `
|.{1,${columnWidth - 1}}([${breaks}]|$)|[^${breaks}]+?([${breaks}]|$)`,
          "g"
        );
        const lines = columnText.match(regex) || [];
        return leadingStr + lines.map((line, i) => {
          if (line === "\n") return "";
          return (i > 0 ? indentString : "") + line.trimEnd();
        }).join("\n");
      }
    };
    exports2.Help = Help2;
  }
});

// ../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/option.js
var require_option = __commonJS({
  "../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/option.js"(exports2) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Option2 = class {
      /**
       * Initialize a new `Option` with the given `flags` and `description`.
       *
       * @param {string} flags
       * @param {string} [description]
       */
      constructor(flags, description) {
        this.flags = flags;
        this.description = description || "";
        this.required = flags.includes("<");
        this.optional = flags.includes("[");
        this.variadic = /\w\.\.\.[>\]]$/.test(flags);
        this.mandatory = false;
        const optionFlags = splitOptionFlags(flags);
        this.short = optionFlags.shortFlag;
        this.long = optionFlags.longFlag;
        this.negate = false;
        if (this.long) {
          this.negate = this.long.startsWith("--no-");
        }
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.presetArg = void 0;
        this.envVar = void 0;
        this.parseArg = void 0;
        this.hidden = false;
        this.argChoices = void 0;
        this.conflictsWith = [];
        this.implied = void 0;
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Option}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Preset to use when option used without option-argument, especially optional but also boolean and negated.
       * The custom processing (parseArg) is called.
       *
       * @example
       * new Option('--color').default('GREYSCALE').preset('RGB');
       * new Option('--donate [amount]').preset('20').argParser(parseFloat);
       *
       * @param {*} arg
       * @return {Option}
       */
      preset(arg) {
        this.presetArg = arg;
        return this;
      }
      /**
       * Add option name(s) that conflict with this option.
       * An error will be displayed if conflicting options are found during parsing.
       *
       * @example
       * new Option('--rgb').conflicts('cmyk');
       * new Option('--js').conflicts(['ts', 'jsx']);
       *
       * @param {(string | string[])} names
       * @return {Option}
       */
      conflicts(names) {
        this.conflictsWith = this.conflictsWith.concat(names);
        return this;
      }
      /**
       * Specify implied option values for when this option is set and the implied options are not.
       *
       * The custom processing (parseArg) is not called on the implied values.
       *
       * @example
       * program
       *   .addOption(new Option('--log', 'write logging information to file'))
       *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
       *
       * @param {object} impliedOptionValues
       * @return {Option}
       */
      implies(impliedOptionValues) {
        let newImplied = impliedOptionValues;
        if (typeof impliedOptionValues === "string") {
          newImplied = { [impliedOptionValues]: true };
        }
        this.implied = Object.assign(this.implied || {}, newImplied);
        return this;
      }
      /**
       * Set environment variable to check for option value.
       *
       * An environment variable is only used if when processed the current option value is
       * undefined, or the source of the current value is 'default' or 'config' or 'env'.
       *
       * @param {string} name
       * @return {Option}
       */
      env(name) {
        this.envVar = name;
        return this;
      }
      /**
       * Set the custom handler for processing CLI option arguments into option values.
       *
       * @param {Function} [fn]
       * @return {Option}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Whether the option is mandatory and must have a value after parsing.
       *
       * @param {boolean} [mandatory=true]
       * @return {Option}
       */
      makeOptionMandatory(mandatory = true) {
        this.mandatory = !!mandatory;
        return this;
      }
      /**
       * Hide option in help.
       *
       * @param {boolean} [hide=true]
       * @return {Option}
       */
      hideHelp(hide = true) {
        this.hidden = !!hide;
        return this;
      }
      /**
       * @package
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Only allow option value to be one of choices.
       *
       * @param {string[]} values
       * @return {Option}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Return option name.
       *
       * @return {string}
       */
      name() {
        if (this.long) {
          return this.long.replace(/^--/, "");
        }
        return this.short.replace(/^-/, "");
      }
      /**
       * Return option name, in a camelcase format that can be used
       * as a object attribute key.
       *
       * @return {string}
       */
      attributeName() {
        return camelcase(this.name().replace(/^no-/, ""));
      }
      /**
       * Check if `arg` matches the short or long flag.
       *
       * @param {string} arg
       * @return {boolean}
       * @package
       */
      is(arg) {
        return this.short === arg || this.long === arg;
      }
      /**
       * Return whether a boolean option.
       *
       * Options are one of boolean, negated, required argument, or optional argument.
       *
       * @return {boolean}
       * @package
       */
      isBoolean() {
        return !this.required && !this.optional && !this.negate;
      }
    };
    var DualOptions = class {
      /**
       * @param {Option[]} options
       */
      constructor(options) {
        this.positiveOptions = /* @__PURE__ */ new Map();
        this.negativeOptions = /* @__PURE__ */ new Map();
        this.dualOptions = /* @__PURE__ */ new Set();
        options.forEach((option) => {
          if (option.negate) {
            this.negativeOptions.set(option.attributeName(), option);
          } else {
            this.positiveOptions.set(option.attributeName(), option);
          }
        });
        this.negativeOptions.forEach((value, key) => {
          if (this.positiveOptions.has(key)) {
            this.dualOptions.add(key);
          }
        });
      }
      /**
       * Did the value come from the option, and not from possible matching dual option?
       *
       * @param {*} value
       * @param {Option} option
       * @returns {boolean}
       */
      valueFromOption(value, option) {
        const optionKey = option.attributeName();
        if (!this.dualOptions.has(optionKey)) return true;
        const preset = this.negativeOptions.get(optionKey).presetArg;
        const negativeValue = preset !== void 0 ? preset : false;
        return option.negate === (negativeValue === value);
      }
    };
    function camelcase(str) {
      return str.split("-").reduce((str2, word) => {
        return str2 + word[0].toUpperCase() + word.slice(1);
      });
    }
    function splitOptionFlags(flags) {
      let shortFlag;
      let longFlag;
      const flagParts = flags.split(/[ |,]+/);
      if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1]))
        shortFlag = flagParts.shift();
      longFlag = flagParts.shift();
      if (!shortFlag && /^-[^-]$/.test(longFlag)) {
        shortFlag = longFlag;
        longFlag = void 0;
      }
      return { shortFlag, longFlag };
    }
    exports2.Option = Option2;
    exports2.DualOptions = DualOptions;
  }
});

// ../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/suggestSimilar.js
var require_suggestSimilar = __commonJS({
  "../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/suggestSimilar.js"(exports2) {
    var maxDistance = 3;
    function editDistance(a, b) {
      if (Math.abs(a.length - b.length) > maxDistance)
        return Math.max(a.length, b.length);
      const d = [];
      for (let i = 0; i <= a.length; i++) {
        d[i] = [i];
      }
      for (let j = 0; j <= b.length; j++) {
        d[0][j] = j;
      }
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          let cost = 1;
          if (a[i - 1] === b[j - 1]) {
            cost = 0;
          } else {
            cost = 1;
          }
          d[i][j] = Math.min(
            d[i - 1][j] + 1,
            // deletion
            d[i][j - 1] + 1,
            // insertion
            d[i - 1][j - 1] + cost
            // substitution
          );
          if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
            d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
          }
        }
      }
      return d[a.length][b.length];
    }
    function suggestSimilar(word, candidates) {
      if (!candidates || candidates.length === 0) return "";
      candidates = Array.from(new Set(candidates));
      const searchingOptions = word.startsWith("--");
      if (searchingOptions) {
        word = word.slice(2);
        candidates = candidates.map((candidate) => candidate.slice(2));
      }
      let similar = [];
      let bestDistance = maxDistance;
      const minSimilarity = 0.4;
      candidates.forEach((candidate) => {
        if (candidate.length <= 1) return;
        const distance = editDistance(word, candidate);
        const length = Math.max(word.length, candidate.length);
        const similarity = (length - distance) / length;
        if (similarity > minSimilarity) {
          if (distance < bestDistance) {
            bestDistance = distance;
            similar = [candidate];
          } else if (distance === bestDistance) {
            similar.push(candidate);
          }
        }
      });
      similar.sort((a, b) => a.localeCompare(b));
      if (searchingOptions) {
        similar = similar.map((candidate) => `--${candidate}`);
      }
      if (similar.length > 1) {
        return `
(Did you mean one of ${similar.join(", ")}?)`;
      }
      if (similar.length === 1) {
        return `
(Did you mean ${similar[0]}?)`;
      }
      return "";
    }
    exports2.suggestSimilar = suggestSimilar;
  }
});

// ../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/command.js
var require_command = __commonJS({
  "../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/command.js"(exports2) {
    var EventEmitter = require("node:events").EventEmitter;
    var childProcess = require("node:child_process");
    var path = require("node:path");
    var fs = require("node:fs");
    var process2 = require("node:process");
    var { Argument: Argument2, humanReadableArgName } = require_argument();
    var { CommanderError: CommanderError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2, DualOptions } = require_option();
    var { suggestSimilar } = require_suggestSimilar();
    var Command2 = class _Command extends EventEmitter {
      /**
       * Initialize a new `Command`.
       *
       * @param {string} [name]
       */
      constructor(name) {
        super();
        this.commands = [];
        this.options = [];
        this.parent = null;
        this._allowUnknownOption = false;
        this._allowExcessArguments = true;
        this.registeredArguments = [];
        this._args = this.registeredArguments;
        this.args = [];
        this.rawArgs = [];
        this.processedArgs = [];
        this._scriptPath = null;
        this._name = name || "";
        this._optionValues = {};
        this._optionValueSources = {};
        this._storeOptionsAsProperties = false;
        this._actionHandler = null;
        this._executableHandler = false;
        this._executableFile = null;
        this._executableDir = null;
        this._defaultCommandName = null;
        this._exitCallback = null;
        this._aliases = [];
        this._combineFlagAndOptionalValue = true;
        this._description = "";
        this._summary = "";
        this._argsDescription = void 0;
        this._enablePositionalOptions = false;
        this._passThroughOptions = false;
        this._lifeCycleHooks = {};
        this._showHelpAfterError = false;
        this._showSuggestionAfterError = true;
        this._outputConfiguration = {
          writeOut: (str) => process2.stdout.write(str),
          writeErr: (str) => process2.stderr.write(str),
          getOutHelpWidth: () => process2.stdout.isTTY ? process2.stdout.columns : void 0,
          getErrHelpWidth: () => process2.stderr.isTTY ? process2.stderr.columns : void 0,
          outputError: (str, write) => write(str)
        };
        this._hidden = false;
        this._helpOption = void 0;
        this._addImplicitHelpCommand = void 0;
        this._helpCommand = void 0;
        this._helpConfiguration = {};
      }
      /**
       * Copy settings that are useful to have in common across root command and subcommands.
       *
       * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
       *
       * @param {Command} sourceCommand
       * @return {Command} `this` command for chaining
       */
      copyInheritedSettings(sourceCommand) {
        this._outputConfiguration = sourceCommand._outputConfiguration;
        this._helpOption = sourceCommand._helpOption;
        this._helpCommand = sourceCommand._helpCommand;
        this._helpConfiguration = sourceCommand._helpConfiguration;
        this._exitCallback = sourceCommand._exitCallback;
        this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
        this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
        this._allowExcessArguments = sourceCommand._allowExcessArguments;
        this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
        this._showHelpAfterError = sourceCommand._showHelpAfterError;
        this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
        return this;
      }
      /**
       * @returns {Command[]}
       * @private
       */
      _getCommandAndAncestors() {
        const result = [];
        for (let command = this; command; command = command.parent) {
          result.push(command);
        }
        return result;
      }
      /**
       * Define a command.
       *
       * There are two styles of command: pay attention to where to put the description.
       *
       * @example
       * // Command implemented using action handler (description is supplied separately to `.command`)
       * program
       *   .command('clone <source> [destination]')
       *   .description('clone a repository into a newly created directory')
       *   .action((source, destination) => {
       *     console.log('clone command called');
       *   });
       *
       * // Command implemented using separate executable file (description is second parameter to `.command`)
       * program
       *   .command('start <service>', 'start named service')
       *   .command('stop [service]', 'stop named service, or all if no name supplied');
       *
       * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
       * @param {(object | string)} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
       * @param {object} [execOpts] - configuration options (for executable)
       * @return {Command} returns new command for action handler, or `this` for executable command
       */
      command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
        let desc = actionOptsOrExecDesc;
        let opts = execOpts;
        if (typeof desc === "object" && desc !== null) {
          opts = desc;
          desc = null;
        }
        opts = opts || {};
        const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
        const cmd = this.createCommand(name);
        if (desc) {
          cmd.description(desc);
          cmd._executableHandler = true;
        }
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        cmd._hidden = !!(opts.noHelp || opts.hidden);
        cmd._executableFile = opts.executableFile || null;
        if (args) cmd.arguments(args);
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd.copyInheritedSettings(this);
        if (desc) return this;
        return cmd;
      }
      /**
       * Factory routine to create a new unattached command.
       *
       * See .command() for creating an attached subcommand, which uses this routine to
       * create the command. You can override createCommand to customise subcommands.
       *
       * @param {string} [name]
       * @return {Command} new command
       */
      createCommand(name) {
        return new _Command(name);
      }
      /**
       * You can customise the help with a subclass of Help by overriding createHelp,
       * or by overriding Help properties using configureHelp().
       *
       * @return {Help}
       */
      createHelp() {
        return Object.assign(new Help2(), this.configureHelp());
      }
      /**
       * You can customise the help by overriding Help properties using configureHelp(),
       * or with a subclass of Help by overriding createHelp().
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureHelp(configuration) {
        if (configuration === void 0) return this._helpConfiguration;
        this._helpConfiguration = configuration;
        return this;
      }
      /**
       * The default output goes to stdout and stderr. You can customise this for special
       * applications. You can also customise the display of errors by overriding outputError.
       *
       * The configuration properties are all functions:
       *
       *     // functions to change where being written, stdout and stderr
       *     writeOut(str)
       *     writeErr(str)
       *     // matching functions to specify width for wrapping help
       *     getOutHelpWidth()
       *     getErrHelpWidth()
       *     // functions based on what is being written out
       *     outputError(str, write) // used for displaying errors, and not used for displaying help
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureOutput(configuration) {
        if (configuration === void 0) return this._outputConfiguration;
        Object.assign(this._outputConfiguration, configuration);
        return this;
      }
      /**
       * Display the help or a custom message after an error occurs.
       *
       * @param {(boolean|string)} [displayHelp]
       * @return {Command} `this` command for chaining
       */
      showHelpAfterError(displayHelp = true) {
        if (typeof displayHelp !== "string") displayHelp = !!displayHelp;
        this._showHelpAfterError = displayHelp;
        return this;
      }
      /**
       * Display suggestion of similar commands for unknown commands, or options for unknown options.
       *
       * @param {boolean} [displaySuggestion]
       * @return {Command} `this` command for chaining
       */
      showSuggestionAfterError(displaySuggestion = true) {
        this._showSuggestionAfterError = !!displaySuggestion;
        return this;
      }
      /**
       * Add a prepared subcommand.
       *
       * See .command() for creating an attached subcommand which inherits settings from its parent.
       *
       * @param {Command} cmd - new subcommand
       * @param {object} [opts] - configuration options
       * @return {Command} `this` command for chaining
       */
      addCommand(cmd, opts) {
        if (!cmd._name) {
          throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
        }
        opts = opts || {};
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        if (opts.noHelp || opts.hidden) cmd._hidden = true;
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd._checkForBrokenPassThrough();
        return this;
      }
      /**
       * Factory routine to create a new unattached argument.
       *
       * See .argument() for creating an attached argument, which uses this routine to
       * create the argument. You can override createArgument to return a custom argument.
       *
       * @param {string} name
       * @param {string} [description]
       * @return {Argument} new argument
       */
      createArgument(name, description) {
        return new Argument2(name, description);
      }
      /**
       * Define argument syntax for command.
       *
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @example
       * program.argument('<input-file>');
       * program.argument('[output-file]');
       *
       * @param {string} name
       * @param {string} [description]
       * @param {(Function|*)} [fn] - custom argument processing function
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      argument(name, description, fn, defaultValue) {
        const argument = this.createArgument(name, description);
        if (typeof fn === "function") {
          argument.default(defaultValue).argParser(fn);
        } else {
          argument.default(fn);
        }
        this.addArgument(argument);
        return this;
      }
      /**
       * Define argument syntax for command, adding multiple at once (without descriptions).
       *
       * See also .argument().
       *
       * @example
       * program.arguments('<cmd> [env]');
       *
       * @param {string} names
       * @return {Command} `this` command for chaining
       */
      arguments(names) {
        names.trim().split(/ +/).forEach((detail) => {
          this.argument(detail);
        });
        return this;
      }
      /**
       * Define argument syntax for command, adding a prepared argument.
       *
       * @param {Argument} argument
       * @return {Command} `this` command for chaining
       */
      addArgument(argument) {
        const previousArgument = this.registeredArguments.slice(-1)[0];
        if (previousArgument && previousArgument.variadic) {
          throw new Error(
            `only the last argument can be variadic '${previousArgument.name()}'`
          );
        }
        if (argument.required && argument.defaultValue !== void 0 && argument.parseArg === void 0) {
          throw new Error(
            `a default value for a required argument is never used: '${argument.name()}'`
          );
        }
        this.registeredArguments.push(argument);
        return this;
      }
      /**
       * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
       *
       * @example
       *    program.helpCommand('help [cmd]');
       *    program.helpCommand('help [cmd]', 'show help');
       *    program.helpCommand(false); // suppress default help command
       *    program.helpCommand(true); // add help command even if no subcommands
       *
       * @param {string|boolean} enableOrNameAndArgs - enable with custom name and/or arguments, or boolean to override whether added
       * @param {string} [description] - custom description
       * @return {Command} `this` command for chaining
       */
      helpCommand(enableOrNameAndArgs, description) {
        if (typeof enableOrNameAndArgs === "boolean") {
          this._addImplicitHelpCommand = enableOrNameAndArgs;
          return this;
        }
        enableOrNameAndArgs = enableOrNameAndArgs ?? "help [command]";
        const [, helpName, helpArgs] = enableOrNameAndArgs.match(/([^ ]+) *(.*)/);
        const helpDescription = description ?? "display help for command";
        const helpCommand = this.createCommand(helpName);
        helpCommand.helpOption(false);
        if (helpArgs) helpCommand.arguments(helpArgs);
        if (helpDescription) helpCommand.description(helpDescription);
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        return this;
      }
      /**
       * Add prepared custom help command.
       *
       * @param {(Command|string|boolean)} helpCommand - custom help command, or deprecated enableOrNameAndArgs as for `.helpCommand()`
       * @param {string} [deprecatedDescription] - deprecated custom description used with custom name only
       * @return {Command} `this` command for chaining
       */
      addHelpCommand(helpCommand, deprecatedDescription) {
        if (typeof helpCommand !== "object") {
          this.helpCommand(helpCommand, deprecatedDescription);
          return this;
        }
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        return this;
      }
      /**
       * Lazy create help command.
       *
       * @return {(Command|null)}
       * @package
       */
      _getHelpCommand() {
        const hasImplicitHelpCommand = this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help"));
        if (hasImplicitHelpCommand) {
          if (this._helpCommand === void 0) {
            this.helpCommand(void 0, void 0);
          }
          return this._helpCommand;
        }
        return null;
      }
      /**
       * Add hook for life cycle event.
       *
       * @param {string} event
       * @param {Function} listener
       * @return {Command} `this` command for chaining
       */
      hook(event, listener) {
        const allowedValues = ["preSubcommand", "preAction", "postAction"];
        if (!allowedValues.includes(event)) {
          throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        if (this._lifeCycleHooks[event]) {
          this._lifeCycleHooks[event].push(listener);
        } else {
          this._lifeCycleHooks[event] = [listener];
        }
        return this;
      }
      /**
       * Register callback to use as replacement for calling process.exit.
       *
       * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
       * @return {Command} `this` command for chaining
       */
      exitOverride(fn) {
        if (fn) {
          this._exitCallback = fn;
        } else {
          this._exitCallback = (err) => {
            if (err.code !== "commander.executeSubCommandAsync") {
              throw err;
            } else {
            }
          };
        }
        return this;
      }
      /**
       * Call process.exit, and _exitCallback if defined.
       *
       * @param {number} exitCode exit code for using with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       * @return never
       * @private
       */
      _exit(exitCode, code, message) {
        if (this._exitCallback) {
          this._exitCallback(new CommanderError2(exitCode, code, message));
        }
        process2.exit(exitCode);
      }
      /**
       * Register callback `fn` for the command.
       *
       * @example
       * program
       *   .command('serve')
       *   .description('start service')
       *   .action(function() {
       *      // do work here
       *   });
       *
       * @param {Function} fn
       * @return {Command} `this` command for chaining
       */
      action(fn) {
        const listener = (args) => {
          const expectedArgsCount = this.registeredArguments.length;
          const actionArgs = args.slice(0, expectedArgsCount);
          if (this._storeOptionsAsProperties) {
            actionArgs[expectedArgsCount] = this;
          } else {
            actionArgs[expectedArgsCount] = this.opts();
          }
          actionArgs.push(this);
          return fn.apply(this, actionArgs);
        };
        this._actionHandler = listener;
        return this;
      }
      /**
       * Factory routine to create a new unattached option.
       *
       * See .option() for creating an attached option, which uses this routine to
       * create the option. You can override createOption to return a custom option.
       *
       * @param {string} flags
       * @param {string} [description]
       * @return {Option} new option
       */
      createOption(flags, description) {
        return new Option2(flags, description);
      }
      /**
       * Wrap parseArgs to catch 'commander.invalidArgument'.
       *
       * @param {(Option | Argument)} target
       * @param {string} value
       * @param {*} previous
       * @param {string} invalidArgumentMessage
       * @private
       */
      _callParseArg(target, value, previous, invalidArgumentMessage) {
        try {
          return target.parseArg(value, previous);
        } catch (err) {
          if (err.code === "commander.invalidArgument") {
            const message = `${invalidArgumentMessage} ${err.message}`;
            this.error(message, { exitCode: err.exitCode, code: err.code });
          }
          throw err;
        }
      }
      /**
       * Check for option flag conflicts.
       * Register option if no conflicts found, or throw on conflict.
       *
       * @param {Option} option
       * @private
       */
      _registerOption(option) {
        const matchingOption = option.short && this._findOption(option.short) || option.long && this._findOption(option.long);
        if (matchingOption) {
          const matchingFlag = option.long && this._findOption(option.long) ? option.long : option.short;
          throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
        }
        this.options.push(option);
      }
      /**
       * Check for command name and alias conflicts with existing commands.
       * Register command if no conflicts found, or throw on conflict.
       *
       * @param {Command} command
       * @private
       */
      _registerCommand(command) {
        const knownBy = (cmd) => {
          return [cmd.name()].concat(cmd.aliases());
        };
        const alreadyUsed = knownBy(command).find(
          (name) => this._findCommand(name)
        );
        if (alreadyUsed) {
          const existingCmd = knownBy(this._findCommand(alreadyUsed)).join("|");
          const newCmd = knownBy(command).join("|");
          throw new Error(
            `cannot add command '${newCmd}' as already have command '${existingCmd}'`
          );
        }
        this.commands.push(command);
      }
      /**
       * Add an option.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addOption(option) {
        this._registerOption(option);
        const oname = option.name();
        const name = option.attributeName();
        if (option.negate) {
          const positiveLongFlag = option.long.replace(/^--no-/, "--");
          if (!this._findOption(positiveLongFlag)) {
            this.setOptionValueWithSource(
              name,
              option.defaultValue === void 0 ? true : option.defaultValue,
              "default"
            );
          }
        } else if (option.defaultValue !== void 0) {
          this.setOptionValueWithSource(name, option.defaultValue, "default");
        }
        const handleOptionValue = (val, invalidValueMessage, valueSource) => {
          if (val == null && option.presetArg !== void 0) {
            val = option.presetArg;
          }
          const oldValue = this.getOptionValue(name);
          if (val !== null && option.parseArg) {
            val = this._callParseArg(option, val, oldValue, invalidValueMessage);
          } else if (val !== null && option.variadic) {
            val = option._concatValue(val, oldValue);
          }
          if (val == null) {
            if (option.negate) {
              val = false;
            } else if (option.isBoolean() || option.optional) {
              val = true;
            } else {
              val = "";
            }
          }
          this.setOptionValueWithSource(name, val, valueSource);
        };
        this.on("option:" + oname, (val) => {
          const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
          handleOptionValue(val, invalidValueMessage, "cli");
        });
        if (option.envVar) {
          this.on("optionEnv:" + oname, (val) => {
            const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
            handleOptionValue(val, invalidValueMessage, "env");
          });
        }
        return this;
      }
      /**
       * Internal implementation shared by .option() and .requiredOption()
       *
       * @return {Command} `this` command for chaining
       * @private
       */
      _optionEx(config, flags, description, fn, defaultValue) {
        if (typeof flags === "object" && flags instanceof Option2) {
          throw new Error(
            "To add an Option object use addOption() instead of option() or requiredOption()"
          );
        }
        const option = this.createOption(flags, description);
        option.makeOptionMandatory(!!config.mandatory);
        if (typeof fn === "function") {
          option.default(defaultValue).argParser(fn);
        } else if (fn instanceof RegExp) {
          const regex = fn;
          fn = (val, def) => {
            const m = regex.exec(val);
            return m ? m[0] : def;
          };
          option.default(defaultValue).argParser(fn);
        } else {
          option.default(fn);
        }
        return this.addOption(option);
      }
      /**
       * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
       * option-argument is indicated by `<>` and an optional option-argument by `[]`.
       *
       * See the README for more details, and see also addOption() and requiredOption().
       *
       * @example
       * program
       *     .option('-p, --pepper', 'add pepper')
       *     .option('-p, --pizza-type <TYPE>', 'type of pizza') // required option-argument
       *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
       *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      option(flags, description, parseArg, defaultValue) {
        return this._optionEx({}, flags, description, parseArg, defaultValue);
      }
      /**
       * Add a required option which must have a value after parsing. This usually means
       * the option must be specified on the command line. (Otherwise the same as .option().)
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      requiredOption(flags, description, parseArg, defaultValue) {
        return this._optionEx(
          { mandatory: true },
          flags,
          description,
          parseArg,
          defaultValue
        );
      }
      /**
       * Alter parsing of short flags with optional values.
       *
       * @example
       * // for `.option('-f,--flag [value]'):
       * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
       * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
       *
       * @param {boolean} [combine] - if `true` or omitted, an optional value can be specified directly after the flag.
       * @return {Command} `this` command for chaining
       */
      combineFlagAndOptionalValue(combine = true) {
        this._combineFlagAndOptionalValue = !!combine;
        return this;
      }
      /**
       * Allow unknown options on the command line.
       *
       * @param {boolean} [allowUnknown] - if `true` or omitted, no error will be thrown for unknown options.
       * @return {Command} `this` command for chaining
       */
      allowUnknownOption(allowUnknown = true) {
        this._allowUnknownOption = !!allowUnknown;
        return this;
      }
      /**
       * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
       *
       * @param {boolean} [allowExcess] - if `true` or omitted, no error will be thrown for excess arguments.
       * @return {Command} `this` command for chaining
       */
      allowExcessArguments(allowExcess = true) {
        this._allowExcessArguments = !!allowExcess;
        return this;
      }
      /**
       * Enable positional options. Positional means global options are specified before subcommands which lets
       * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
       * The default behaviour is non-positional and global options may appear anywhere on the command line.
       *
       * @param {boolean} [positional]
       * @return {Command} `this` command for chaining
       */
      enablePositionalOptions(positional = true) {
        this._enablePositionalOptions = !!positional;
        return this;
      }
      /**
       * Pass through options that come after command-arguments rather than treat them as command-options,
       * so actual command-options come before command-arguments. Turning this on for a subcommand requires
       * positional options to have been enabled on the program (parent commands).
       * The default behaviour is non-positional and options may appear before or after command-arguments.
       *
       * @param {boolean} [passThrough] for unknown options.
       * @return {Command} `this` command for chaining
       */
      passThroughOptions(passThrough = true) {
        this._passThroughOptions = !!passThrough;
        this._checkForBrokenPassThrough();
        return this;
      }
      /**
       * @private
       */
      _checkForBrokenPassThrough() {
        if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions) {
          throw new Error(
            `passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`
          );
        }
      }
      /**
       * Whether to store option values as properties on command object,
       * or store separately (specify false). In both cases the option values can be accessed using .opts().
       *
       * @param {boolean} [storeAsProperties=true]
       * @return {Command} `this` command for chaining
       */
      storeOptionsAsProperties(storeAsProperties = true) {
        if (this.options.length) {
          throw new Error("call .storeOptionsAsProperties() before adding options");
        }
        if (Object.keys(this._optionValues).length) {
          throw new Error(
            "call .storeOptionsAsProperties() before setting option values"
          );
        }
        this._storeOptionsAsProperties = !!storeAsProperties;
        return this;
      }
      /**
       * Retrieve option value.
       *
       * @param {string} key
       * @return {object} value
       */
      getOptionValue(key) {
        if (this._storeOptionsAsProperties) {
          return this[key];
        }
        return this._optionValues[key];
      }
      /**
       * Store option value.
       *
       * @param {string} key
       * @param {object} value
       * @return {Command} `this` command for chaining
       */
      setOptionValue(key, value) {
        return this.setOptionValueWithSource(key, value, void 0);
      }
      /**
       * Store option value and where the value came from.
       *
       * @param {string} key
       * @param {object} value
       * @param {string} source - expected values are default/config/env/cli/implied
       * @return {Command} `this` command for chaining
       */
      setOptionValueWithSource(key, value, source) {
        if (this._storeOptionsAsProperties) {
          this[key] = value;
        } else {
          this._optionValues[key] = value;
        }
        this._optionValueSources[key] = source;
        return this;
      }
      /**
       * Get source of option value.
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSource(key) {
        return this._optionValueSources[key];
      }
      /**
       * Get source of option value. See also .optsWithGlobals().
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSourceWithGlobals(key) {
        let source;
        this._getCommandAndAncestors().forEach((cmd) => {
          if (cmd.getOptionValueSource(key) !== void 0) {
            source = cmd.getOptionValueSource(key);
          }
        });
        return source;
      }
      /**
       * Get user arguments from implied or explicit arguments.
       * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
       *
       * @private
       */
      _prepareUserArgs(argv, parseOptions) {
        if (argv !== void 0 && !Array.isArray(argv)) {
          throw new Error("first parameter to parse must be array or undefined");
        }
        parseOptions = parseOptions || {};
        if (argv === void 0 && parseOptions.from === void 0) {
          if (process2.versions?.electron) {
            parseOptions.from = "electron";
          }
          const execArgv = process2.execArgv ?? [];
          if (execArgv.includes("-e") || execArgv.includes("--eval") || execArgv.includes("-p") || execArgv.includes("--print")) {
            parseOptions.from = "eval";
          }
        }
        if (argv === void 0) {
          argv = process2.argv;
        }
        this.rawArgs = argv.slice();
        let userArgs;
        switch (parseOptions.from) {
          case void 0:
          case "node":
            this._scriptPath = argv[1];
            userArgs = argv.slice(2);
            break;
          case "electron":
            if (process2.defaultApp) {
              this._scriptPath = argv[1];
              userArgs = argv.slice(2);
            } else {
              userArgs = argv.slice(1);
            }
            break;
          case "user":
            userArgs = argv.slice(0);
            break;
          case "eval":
            userArgs = argv.slice(1);
            break;
          default:
            throw new Error(
              `unexpected parse option { from: '${parseOptions.from}' }`
            );
        }
        if (!this._name && this._scriptPath)
          this.nameFromFilename(this._scriptPath);
        this._name = this._name || "program";
        return userArgs;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Use parseAsync instead of parse if any of your action handlers are async.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * program.parse(); // parse process.argv and auto-detect electron and special node flags
       * program.parse(process.argv); // assume argv[0] is app and argv[1] is script
       * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv] - optional, defaults to process.argv
       * @param {object} [parseOptions] - optionally specify style of options with from: node/user/electron
       * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
       * @return {Command} `this` command for chaining
       */
      parse(argv, parseOptions) {
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * await program.parseAsync(); // parse process.argv and auto-detect electron and special node flags
       * await program.parseAsync(process.argv); // assume argv[0] is app and argv[1] is script
       * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv]
       * @param {object} [parseOptions]
       * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
       * @return {Promise}
       */
      async parseAsync(argv, parseOptions) {
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        await this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Execute a sub-command executable.
       *
       * @private
       */
      _executeSubCommand(subcommand, args) {
        args = args.slice();
        let launchWithNode = false;
        const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
        function findFile(baseDir, baseName) {
          const localBin = path.resolve(baseDir, baseName);
          if (fs.existsSync(localBin)) return localBin;
          if (sourceExt.includes(path.extname(baseName))) return void 0;
          const foundExt = sourceExt.find(
            (ext) => fs.existsSync(`${localBin}${ext}`)
          );
          if (foundExt) return `${localBin}${foundExt}`;
          return void 0;
        }
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
        let executableDir = this._executableDir || "";
        if (this._scriptPath) {
          let resolvedScriptPath;
          try {
            resolvedScriptPath = fs.realpathSync(this._scriptPath);
          } catch (err) {
            resolvedScriptPath = this._scriptPath;
          }
          executableDir = path.resolve(
            path.dirname(resolvedScriptPath),
            executableDir
          );
        }
        if (executableDir) {
          let localFile = findFile(executableDir, executableFile);
          if (!localFile && !subcommand._executableFile && this._scriptPath) {
            const legacyName = path.basename(
              this._scriptPath,
              path.extname(this._scriptPath)
            );
            if (legacyName !== this._name) {
              localFile = findFile(
                executableDir,
                `${legacyName}-${subcommand._name}`
              );
            }
          }
          executableFile = localFile || executableFile;
        }
        launchWithNode = sourceExt.includes(path.extname(executableFile));
        let proc;
        if (process2.platform !== "win32") {
          if (launchWithNode) {
            args.unshift(executableFile);
            args = incrementNodeInspectorPort(process2.execArgv).concat(args);
            proc = childProcess.spawn(process2.argv[0], args, { stdio: "inherit" });
          } else {
            proc = childProcess.spawn(executableFile, args, { stdio: "inherit" });
          }
        } else {
          args.unshift(executableFile);
          args = incrementNodeInspectorPort(process2.execArgv).concat(args);
          proc = childProcess.spawn(process2.execPath, args, { stdio: "inherit" });
        }
        if (!proc.killed) {
          const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
          signals.forEach((signal) => {
            process2.on(signal, () => {
              if (proc.killed === false && proc.exitCode === null) {
                proc.kill(signal);
              }
            });
          });
        }
        const exitCallback = this._exitCallback;
        proc.on("close", (code) => {
          code = code ?? 1;
          if (!exitCallback) {
            process2.exit(code);
          } else {
            exitCallback(
              new CommanderError2(
                code,
                "commander.executeSubCommandAsync",
                "(close)"
              )
            );
          }
        });
        proc.on("error", (err) => {
          if (err.code === "ENOENT") {
            const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
            const executableMissing = `'${executableFile}' does not exist
 - if '${subcommand._name}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
            throw new Error(executableMissing);
          } else if (err.code === "EACCES") {
            throw new Error(`'${executableFile}' not executable`);
          }
          if (!exitCallback) {
            process2.exit(1);
          } else {
            const wrappedError = new CommanderError2(
              1,
              "commander.executeSubCommandAsync",
              "(error)"
            );
            wrappedError.nestedError = err;
            exitCallback(wrappedError);
          }
        });
        this.runningCommand = proc;
      }
      /**
       * @private
       */
      _dispatchSubcommand(commandName, operands, unknown) {
        const subCommand = this._findCommand(commandName);
        if (!subCommand) this.help({ error: true });
        let promiseChain;
        promiseChain = this._chainOrCallSubCommandHook(
          promiseChain,
          subCommand,
          "preSubcommand"
        );
        promiseChain = this._chainOrCall(promiseChain, () => {
          if (subCommand._executableHandler) {
            this._executeSubCommand(subCommand, operands.concat(unknown));
          } else {
            return subCommand._parseCommand(operands, unknown);
          }
        });
        return promiseChain;
      }
      /**
       * Invoke help directly if possible, or dispatch if necessary.
       * e.g. help foo
       *
       * @private
       */
      _dispatchHelpCommand(subcommandName) {
        if (!subcommandName) {
          this.help();
        }
        const subCommand = this._findCommand(subcommandName);
        if (subCommand && !subCommand._executableHandler) {
          subCommand.help();
        }
        return this._dispatchSubcommand(
          subcommandName,
          [],
          [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"]
        );
      }
      /**
       * Check this.args against expected this.registeredArguments.
       *
       * @private
       */
      _checkNumberOfArguments() {
        this.registeredArguments.forEach((arg, i) => {
          if (arg.required && this.args[i] == null) {
            this.missingArgument(arg.name());
          }
        });
        if (this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) {
          return;
        }
        if (this.args.length > this.registeredArguments.length) {
          this._excessArguments(this.args);
        }
      }
      /**
       * Process this.args using this.registeredArguments and save as this.processedArgs!
       *
       * @private
       */
      _processArguments() {
        const myParseArg = (argument, value, previous) => {
          let parsedValue = value;
          if (value !== null && argument.parseArg) {
            const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
            parsedValue = this._callParseArg(
              argument,
              value,
              previous,
              invalidValueMessage
            );
          }
          return parsedValue;
        };
        this._checkNumberOfArguments();
        const processedArgs = [];
        this.registeredArguments.forEach((declaredArg, index) => {
          let value = declaredArg.defaultValue;
          if (declaredArg.variadic) {
            if (index < this.args.length) {
              value = this.args.slice(index);
              if (declaredArg.parseArg) {
                value = value.reduce((processed, v) => {
                  return myParseArg(declaredArg, v, processed);
                }, declaredArg.defaultValue);
              }
            } else if (value === void 0) {
              value = [];
            }
          } else if (index < this.args.length) {
            value = this.args[index];
            if (declaredArg.parseArg) {
              value = myParseArg(declaredArg, value, declaredArg.defaultValue);
            }
          }
          processedArgs[index] = value;
        });
        this.processedArgs = processedArgs;
      }
      /**
       * Once we have a promise we chain, but call synchronously until then.
       *
       * @param {(Promise|undefined)} promise
       * @param {Function} fn
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCall(promise, fn) {
        if (promise && promise.then && typeof promise.then === "function") {
          return promise.then(() => fn());
        }
        return fn();
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallHooks(promise, event) {
        let result = promise;
        const hooks = [];
        this._getCommandAndAncestors().reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== void 0).forEach((hookedCommand) => {
          hookedCommand._lifeCycleHooks[event].forEach((callback) => {
            hooks.push({ hookedCommand, callback });
          });
        });
        if (event === "postAction") {
          hooks.reverse();
        }
        hooks.forEach((hookDetail) => {
          result = this._chainOrCall(result, () => {
            return hookDetail.callback(hookDetail.hookedCommand, this);
          });
        });
        return result;
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {Command} subCommand
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallSubCommandHook(promise, subCommand, event) {
        let result = promise;
        if (this._lifeCycleHooks[event] !== void 0) {
          this._lifeCycleHooks[event].forEach((hook) => {
            result = this._chainOrCall(result, () => {
              return hook(this, subCommand);
            });
          });
        }
        return result;
      }
      /**
       * Process arguments in context of this command.
       * Returns action result, in case it is a promise.
       *
       * @private
       */
      _parseCommand(operands, unknown) {
        const parsed = this.parseOptions(unknown);
        this._parseOptionsEnv();
        this._parseOptionsImplied();
        operands = operands.concat(parsed.operands);
        unknown = parsed.unknown;
        this.args = operands.concat(unknown);
        if (operands && this._findCommand(operands[0])) {
          return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
        }
        if (this._getHelpCommand() && operands[0] === this._getHelpCommand().name()) {
          return this._dispatchHelpCommand(operands[1]);
        }
        if (this._defaultCommandName) {
          this._outputHelpIfRequested(unknown);
          return this._dispatchSubcommand(
            this._defaultCommandName,
            operands,
            unknown
          );
        }
        if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
          this.help({ error: true });
        }
        this._outputHelpIfRequested(parsed.unknown);
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        const checkForUnknownOptions = () => {
          if (parsed.unknown.length > 0) {
            this.unknownOption(parsed.unknown[0]);
          }
        };
        const commandEvent = `command:${this.name()}`;
        if (this._actionHandler) {
          checkForUnknownOptions();
          this._processArguments();
          let promiseChain;
          promiseChain = this._chainOrCallHooks(promiseChain, "preAction");
          promiseChain = this._chainOrCall(
            promiseChain,
            () => this._actionHandler(this.processedArgs)
          );
          if (this.parent) {
            promiseChain = this._chainOrCall(promiseChain, () => {
              this.parent.emit(commandEvent, operands, unknown);
            });
          }
          promiseChain = this._chainOrCallHooks(promiseChain, "postAction");
          return promiseChain;
        }
        if (this.parent && this.parent.listenerCount(commandEvent)) {
          checkForUnknownOptions();
          this._processArguments();
          this.parent.emit(commandEvent, operands, unknown);
        } else if (operands.length) {
          if (this._findCommand("*")) {
            return this._dispatchSubcommand("*", operands, unknown);
          }
          if (this.listenerCount("command:*")) {
            this.emit("command:*", operands, unknown);
          } else if (this.commands.length) {
            this.unknownCommand();
          } else {
            checkForUnknownOptions();
            this._processArguments();
          }
        } else if (this.commands.length) {
          checkForUnknownOptions();
          this.help({ error: true });
        } else {
          checkForUnknownOptions();
          this._processArguments();
        }
      }
      /**
       * Find matching command.
       *
       * @private
       * @return {Command | undefined}
       */
      _findCommand(name) {
        if (!name) return void 0;
        return this.commands.find(
          (cmd) => cmd._name === name || cmd._aliases.includes(name)
        );
      }
      /**
       * Return an option matching `arg` if any.
       *
       * @param {string} arg
       * @return {Option}
       * @package
       */
      _findOption(arg) {
        return this.options.find((option) => option.is(arg));
      }
      /**
       * Display an error message if a mandatory option does not have a value.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForMissingMandatoryOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd.options.forEach((anOption) => {
            if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === void 0) {
              cmd.missingMandatoryOptionValue(anOption);
            }
          });
        });
      }
      /**
       * Display an error message if conflicting options are used together in this.
       *
       * @private
       */
      _checkForConflictingLocalOptions() {
        const definedNonDefaultOptions = this.options.filter((option) => {
          const optionKey = option.attributeName();
          if (this.getOptionValue(optionKey) === void 0) {
            return false;
          }
          return this.getOptionValueSource(optionKey) !== "default";
        });
        const optionsWithConflicting = definedNonDefaultOptions.filter(
          (option) => option.conflictsWith.length > 0
        );
        optionsWithConflicting.forEach((option) => {
          const conflictingAndDefined = definedNonDefaultOptions.find(
            (defined) => option.conflictsWith.includes(defined.attributeName())
          );
          if (conflictingAndDefined) {
            this._conflictingOption(option, conflictingAndDefined);
          }
        });
      }
      /**
       * Display an error message if conflicting options are used together.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForConflictingOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd._checkForConflictingLocalOptions();
        });
      }
      /**
       * Parse options from `argv` removing known options,
       * and return argv split into operands and unknown arguments.
       *
       * Examples:
       *
       *     argv => operands, unknown
       *     --known kkk op => [op], []
       *     op --known kkk => [op], []
       *     sub --unknown uuu op => [sub], [--unknown uuu op]
       *     sub -- --unknown uuu op => [sub --unknown uuu op], []
       *
       * @param {string[]} argv
       * @return {{operands: string[], unknown: string[]}}
       */
      parseOptions(argv) {
        const operands = [];
        const unknown = [];
        let dest = operands;
        const args = argv.slice();
        function maybeOption(arg) {
          return arg.length > 1 && arg[0] === "-";
        }
        let activeVariadicOption = null;
        while (args.length) {
          const arg = args.shift();
          if (arg === "--") {
            if (dest === unknown) dest.push(arg);
            dest.push(...args);
            break;
          }
          if (activeVariadicOption && !maybeOption(arg)) {
            this.emit(`option:${activeVariadicOption.name()}`, arg);
            continue;
          }
          activeVariadicOption = null;
          if (maybeOption(arg)) {
            const option = this._findOption(arg);
            if (option) {
              if (option.required) {
                const value = args.shift();
                if (value === void 0) this.optionMissingArgument(option);
                this.emit(`option:${option.name()}`, value);
              } else if (option.optional) {
                let value = null;
                if (args.length > 0 && !maybeOption(args[0])) {
                  value = args.shift();
                }
                this.emit(`option:${option.name()}`, value);
              } else {
                this.emit(`option:${option.name()}`);
              }
              activeVariadicOption = option.variadic ? option : null;
              continue;
            }
          }
          if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
            const option = this._findOption(`-${arg[1]}`);
            if (option) {
              if (option.required || option.optional && this._combineFlagAndOptionalValue) {
                this.emit(`option:${option.name()}`, arg.slice(2));
              } else {
                this.emit(`option:${option.name()}`);
                args.unshift(`-${arg.slice(2)}`);
              }
              continue;
            }
          }
          if (/^--[^=]+=/.test(arg)) {
            const index = arg.indexOf("=");
            const option = this._findOption(arg.slice(0, index));
            if (option && (option.required || option.optional)) {
              this.emit(`option:${option.name()}`, arg.slice(index + 1));
              continue;
            }
          }
          if (maybeOption(arg)) {
            dest = unknown;
          }
          if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
            if (this._findCommand(arg)) {
              operands.push(arg);
              if (args.length > 0) unknown.push(...args);
              break;
            } else if (this._getHelpCommand() && arg === this._getHelpCommand().name()) {
              operands.push(arg);
              if (args.length > 0) operands.push(...args);
              break;
            } else if (this._defaultCommandName) {
              unknown.push(arg);
              if (args.length > 0) unknown.push(...args);
              break;
            }
          }
          if (this._passThroughOptions) {
            dest.push(arg);
            if (args.length > 0) dest.push(...args);
            break;
          }
          dest.push(arg);
        }
        return { operands, unknown };
      }
      /**
       * Return an object containing local option values as key-value pairs.
       *
       * @return {object}
       */
      opts() {
        if (this._storeOptionsAsProperties) {
          const result = {};
          const len = this.options.length;
          for (let i = 0; i < len; i++) {
            const key = this.options[i].attributeName();
            result[key] = key === this._versionOptionName ? this._version : this[key];
          }
          return result;
        }
        return this._optionValues;
      }
      /**
       * Return an object containing merged local and global option values as key-value pairs.
       *
       * @return {object}
       */
      optsWithGlobals() {
        return this._getCommandAndAncestors().reduce(
          (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
          {}
        );
      }
      /**
       * Display error message and exit (or call exitOverride).
       *
       * @param {string} message
       * @param {object} [errorOptions]
       * @param {string} [errorOptions.code] - an id string representing the error
       * @param {number} [errorOptions.exitCode] - used with process.exit
       */
      error(message, errorOptions) {
        this._outputConfiguration.outputError(
          `${message}
`,
          this._outputConfiguration.writeErr
        );
        if (typeof this._showHelpAfterError === "string") {
          this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
        } else if (this._showHelpAfterError) {
          this._outputConfiguration.writeErr("\n");
          this.outputHelp({ error: true });
        }
        const config = errorOptions || {};
        const exitCode = config.exitCode || 1;
        const code = config.code || "commander.error";
        this._exit(exitCode, code, message);
      }
      /**
       * Apply any option related environment variables, if option does
       * not have a value from cli or client code.
       *
       * @private
       */
      _parseOptionsEnv() {
        this.options.forEach((option) => {
          if (option.envVar && option.envVar in process2.env) {
            const optionKey = option.attributeName();
            if (this.getOptionValue(optionKey) === void 0 || ["default", "config", "env"].includes(
              this.getOptionValueSource(optionKey)
            )) {
              if (option.required || option.optional) {
                this.emit(`optionEnv:${option.name()}`, process2.env[option.envVar]);
              } else {
                this.emit(`optionEnv:${option.name()}`);
              }
            }
          }
        });
      }
      /**
       * Apply any implied option values, if option is undefined or default value.
       *
       * @private
       */
      _parseOptionsImplied() {
        const dualHelper = new DualOptions(this.options);
        const hasCustomOptionValue = (optionKey) => {
          return this.getOptionValue(optionKey) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
        };
        this.options.filter(
          (option) => option.implied !== void 0 && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(
            this.getOptionValue(option.attributeName()),
            option
          )
        ).forEach((option) => {
          Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
            this.setOptionValueWithSource(
              impliedKey,
              option.implied[impliedKey],
              "implied"
            );
          });
        });
      }
      /**
       * Argument `name` is missing.
       *
       * @param {string} name
       * @private
       */
      missingArgument(name) {
        const message = `error: missing required argument '${name}'`;
        this.error(message, { code: "commander.missingArgument" });
      }
      /**
       * `Option` is missing an argument.
       *
       * @param {Option} option
       * @private
       */
      optionMissingArgument(option) {
        const message = `error: option '${option.flags}' argument missing`;
        this.error(message, { code: "commander.optionMissingArgument" });
      }
      /**
       * `Option` does not have a value, and is a mandatory option.
       *
       * @param {Option} option
       * @private
       */
      missingMandatoryOptionValue(option) {
        const message = `error: required option '${option.flags}' not specified`;
        this.error(message, { code: "commander.missingMandatoryOptionValue" });
      }
      /**
       * `Option` conflicts with another option.
       *
       * @param {Option} option
       * @param {Option} conflictingOption
       * @private
       */
      _conflictingOption(option, conflictingOption) {
        const findBestOptionFromValue = (option2) => {
          const optionKey = option2.attributeName();
          const optionValue = this.getOptionValue(optionKey);
          const negativeOption = this.options.find(
            (target) => target.negate && optionKey === target.attributeName()
          );
          const positiveOption = this.options.find(
            (target) => !target.negate && optionKey === target.attributeName()
          );
          if (negativeOption && (negativeOption.presetArg === void 0 && optionValue === false || negativeOption.presetArg !== void 0 && optionValue === negativeOption.presetArg)) {
            return negativeOption;
          }
          return positiveOption || option2;
        };
        const getErrorMessage = (option2) => {
          const bestOption = findBestOptionFromValue(option2);
          const optionKey = bestOption.attributeName();
          const source = this.getOptionValueSource(optionKey);
          if (source === "env") {
            return `environment variable '${bestOption.envVar}'`;
          }
          return `option '${bestOption.flags}'`;
        };
        const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
        this.error(message, { code: "commander.conflictingOption" });
      }
      /**
       * Unknown option `flag`.
       *
       * @param {string} flag
       * @private
       */
      unknownOption(flag) {
        if (this._allowUnknownOption) return;
        let suggestion = "";
        if (flag.startsWith("--") && this._showSuggestionAfterError) {
          let candidateFlags = [];
          let command = this;
          do {
            const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
            candidateFlags = candidateFlags.concat(moreFlags);
            command = command.parent;
          } while (command && !command._enablePositionalOptions);
          suggestion = suggestSimilar(flag, candidateFlags);
        }
        const message = `error: unknown option '${flag}'${suggestion}`;
        this.error(message, { code: "commander.unknownOption" });
      }
      /**
       * Excess arguments, more than expected.
       *
       * @param {string[]} receivedArgs
       * @private
       */
      _excessArguments(receivedArgs) {
        if (this._allowExcessArguments) return;
        const expected = this.registeredArguments.length;
        const s = expected === 1 ? "" : "s";
        const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
        const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
        this.error(message, { code: "commander.excessArguments" });
      }
      /**
       * Unknown command.
       *
       * @private
       */
      unknownCommand() {
        const unknownName = this.args[0];
        let suggestion = "";
        if (this._showSuggestionAfterError) {
          const candidateNames = [];
          this.createHelp().visibleCommands(this).forEach((command) => {
            candidateNames.push(command.name());
            if (command.alias()) candidateNames.push(command.alias());
          });
          suggestion = suggestSimilar(unknownName, candidateNames);
        }
        const message = `error: unknown command '${unknownName}'${suggestion}`;
        this.error(message, { code: "commander.unknownCommand" });
      }
      /**
       * Get or set the program version.
       *
       * This method auto-registers the "-V, --version" option which will print the version number.
       *
       * You can optionally supply the flags and description to override the defaults.
       *
       * @param {string} [str]
       * @param {string} [flags]
       * @param {string} [description]
       * @return {(this | string | undefined)} `this` command for chaining, or version string if no arguments
       */
      version(str, flags, description) {
        if (str === void 0) return this._version;
        this._version = str;
        flags = flags || "-V, --version";
        description = description || "output the version number";
        const versionOption = this.createOption(flags, description);
        this._versionOptionName = versionOption.attributeName();
        this._registerOption(versionOption);
        this.on("option:" + versionOption.name(), () => {
          this._outputConfiguration.writeOut(`${str}
`);
          this._exit(0, "commander.version", str);
        });
        return this;
      }
      /**
       * Set the description.
       *
       * @param {string} [str]
       * @param {object} [argsDescription]
       * @return {(string|Command)}
       */
      description(str, argsDescription) {
        if (str === void 0 && argsDescription === void 0)
          return this._description;
        this._description = str;
        if (argsDescription) {
          this._argsDescription = argsDescription;
        }
        return this;
      }
      /**
       * Set the summary. Used when listed as subcommand of parent.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      summary(str) {
        if (str === void 0) return this._summary;
        this._summary = str;
        return this;
      }
      /**
       * Set an alias for the command.
       *
       * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
       *
       * @param {string} [alias]
       * @return {(string|Command)}
       */
      alias(alias) {
        if (alias === void 0) return this._aliases[0];
        let command = this;
        if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
          command = this.commands[this.commands.length - 1];
        }
        if (alias === command._name)
          throw new Error("Command alias can't be the same as its name");
        const matchingCommand = this.parent?._findCommand(alias);
        if (matchingCommand) {
          const existingCmd = [matchingCommand.name()].concat(matchingCommand.aliases()).join("|");
          throw new Error(
            `cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`
          );
        }
        command._aliases.push(alias);
        return this;
      }
      /**
       * Set aliases for the command.
       *
       * Only the first alias is shown in the auto-generated help.
       *
       * @param {string[]} [aliases]
       * @return {(string[]|Command)}
       */
      aliases(aliases) {
        if (aliases === void 0) return this._aliases;
        aliases.forEach((alias) => this.alias(alias));
        return this;
      }
      /**
       * Set / get the command usage `str`.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      usage(str) {
        if (str === void 0) {
          if (this._usage) return this._usage;
          const args = this.registeredArguments.map((arg) => {
            return humanReadableArgName(arg);
          });
          return [].concat(
            this.options.length || this._helpOption !== null ? "[options]" : [],
            this.commands.length ? "[command]" : [],
            this.registeredArguments.length ? args : []
          ).join(" ");
        }
        this._usage = str;
        return this;
      }
      /**
       * Get or set the name of the command.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      name(str) {
        if (str === void 0) return this._name;
        this._name = str;
        return this;
      }
      /**
       * Set the name of the command from script filename, such as process.argv[1],
       * or require.main.filename, or __filename.
       *
       * (Used internally and public although not documented in README.)
       *
       * @example
       * program.nameFromFilename(require.main.filename);
       *
       * @param {string} filename
       * @return {Command}
       */
      nameFromFilename(filename) {
        this._name = path.basename(filename, path.extname(filename));
        return this;
      }
      /**
       * Get or set the directory for searching for executable subcommands of this command.
       *
       * @example
       * program.executableDir(__dirname);
       * // or
       * program.executableDir('subcommands');
       *
       * @param {string} [path]
       * @return {(string|null|Command)}
       */
      executableDir(path2) {
        if (path2 === void 0) return this._executableDir;
        this._executableDir = path2;
        return this;
      }
      /**
       * Return program help documentation.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
       * @return {string}
       */
      helpInformation(contextOptions) {
        const helper = this.createHelp();
        if (helper.helpWidth === void 0) {
          helper.helpWidth = contextOptions && contextOptions.error ? this._outputConfiguration.getErrHelpWidth() : this._outputConfiguration.getOutHelpWidth();
        }
        return helper.formatHelp(this, helper);
      }
      /**
       * @private
       */
      _getHelpContext(contextOptions) {
        contextOptions = contextOptions || {};
        const context = { error: !!contextOptions.error };
        let write;
        if (context.error) {
          write = (arg) => this._outputConfiguration.writeErr(arg);
        } else {
          write = (arg) => this._outputConfiguration.writeOut(arg);
        }
        context.write = contextOptions.write || write;
        context.command = this;
        return context;
      }
      /**
       * Output help information for this command.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      outputHelp(contextOptions) {
        let deprecatedCallback;
        if (typeof contextOptions === "function") {
          deprecatedCallback = contextOptions;
          contextOptions = void 0;
        }
        const context = this._getHelpContext(contextOptions);
        this._getCommandAndAncestors().reverse().forEach((command) => command.emit("beforeAllHelp", context));
        this.emit("beforeHelp", context);
        let helpInformation = this.helpInformation(context);
        if (deprecatedCallback) {
          helpInformation = deprecatedCallback(helpInformation);
          if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
            throw new Error("outputHelp callback must return a string or a Buffer");
          }
        }
        context.write(helpInformation);
        if (this._getHelpOption()?.long) {
          this.emit(this._getHelpOption().long);
        }
        this.emit("afterHelp", context);
        this._getCommandAndAncestors().forEach(
          (command) => command.emit("afterAllHelp", context)
        );
      }
      /**
       * You can pass in flags and a description to customise the built-in help option.
       * Pass in false to disable the built-in help option.
       *
       * @example
       * program.helpOption('-?, --help' 'show help'); // customise
       * program.helpOption(false); // disable
       *
       * @param {(string | boolean)} flags
       * @param {string} [description]
       * @return {Command} `this` command for chaining
       */
      helpOption(flags, description) {
        if (typeof flags === "boolean") {
          if (flags) {
            this._helpOption = this._helpOption ?? void 0;
          } else {
            this._helpOption = null;
          }
          return this;
        }
        flags = flags ?? "-h, --help";
        description = description ?? "display help for command";
        this._helpOption = this.createOption(flags, description);
        return this;
      }
      /**
       * Lazy create help option.
       * Returns null if has been disabled with .helpOption(false).
       *
       * @returns {(Option | null)} the help option
       * @package
       */
      _getHelpOption() {
        if (this._helpOption === void 0) {
          this.helpOption(void 0, void 0);
        }
        return this._helpOption;
      }
      /**
       * Supply your own option to use for the built-in help option.
       * This is an alternative to using helpOption() to customise the flags and description etc.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addHelpOption(option) {
        this._helpOption = option;
        return this;
      }
      /**
       * Output help information and exit.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      help(contextOptions) {
        this.outputHelp(contextOptions);
        let exitCode = process2.exitCode || 0;
        if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
          exitCode = 1;
        }
        this._exit(exitCode, "commander.help", "(outputHelp)");
      }
      /**
       * Add additional text to be displayed with the built-in help.
       *
       * Position is 'before' or 'after' to affect just this command,
       * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
       *
       * @param {string} position - before or after built-in help
       * @param {(string | Function)} text - string to add, or a function returning a string
       * @return {Command} `this` command for chaining
       */
      addHelpText(position, text) {
        const allowedValues = ["beforeAll", "before", "after", "afterAll"];
        if (!allowedValues.includes(position)) {
          throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        const helpEvent = `${position}Help`;
        this.on(helpEvent, (context) => {
          let helpStr;
          if (typeof text === "function") {
            helpStr = text({ error: context.error, command: context.command });
          } else {
            helpStr = text;
          }
          if (helpStr) {
            context.write(`${helpStr}
`);
          }
        });
        return this;
      }
      /**
       * Output help information if help flags specified
       *
       * @param {Array} args - array of options to search for help flags
       * @private
       */
      _outputHelpIfRequested(args) {
        const helpOption = this._getHelpOption();
        const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
        if (helpRequested) {
          this.outputHelp();
          this._exit(0, "commander.helpDisplayed", "(outputHelp)");
        }
      }
    };
    function incrementNodeInspectorPort(args) {
      return args.map((arg) => {
        if (!arg.startsWith("--inspect")) {
          return arg;
        }
        let debugOption;
        let debugHost = "127.0.0.1";
        let debugPort = "9229";
        let match;
        if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
          debugOption = match[1];
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
          debugOption = match[1];
          if (/^\d+$/.test(match[3])) {
            debugPort = match[3];
          } else {
            debugHost = match[3];
          }
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
          debugOption = match[1];
          debugHost = match[3];
          debugPort = match[4];
        }
        if (debugOption && debugPort !== "0") {
          return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
        }
        return arg;
      });
    }
    exports2.Command = Command2;
  }
});

// ../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/index.js
var require_commander = __commonJS({
  "../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/index.js"(exports2) {
    var { Argument: Argument2 } = require_argument();
    var { Command: Command2 } = require_command();
    var { CommanderError: CommanderError2, InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2 } = require_option();
    exports2.program = new Command2();
    exports2.createCommand = (name) => new Command2(name);
    exports2.createOption = (flags, description) => new Option2(flags, description);
    exports2.createArgument = (name, description) => new Argument2(name, description);
    exports2.Command = Command2;
    exports2.Option = Option2;
    exports2.Argument = Argument2;
    exports2.Help = Help2;
    exports2.CommanderError = CommanderError2;
    exports2.InvalidArgumentError = InvalidArgumentError2;
    exports2.InvalidOptionArgumentError = InvalidArgumentError2;
  }
});

// ../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/constants.js"(exports2, module2) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module2.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: /* @__PURE__ */ Symbol("kIsForOnEventAttribute"),
      kListener: /* @__PURE__ */ Symbol("kListener"),
      kStatusCode: /* @__PURE__ */ Symbol("status-code"),
      kWebSocket: /* @__PURE__ */ Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// ../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/buffer-util.js"(exports2, module2) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module2.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = require("bufferutil");
        module2.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module2.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// ../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/limiter.js"(exports2, module2) {
    "use strict";
    var kDone = /* @__PURE__ */ Symbol("kDone");
    var kRun = /* @__PURE__ */ Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module2.exports = Limiter;
  }
});

// ../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/permessage-deflate.js"(exports2, module2) {
    "use strict";
    var zlib = require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = /* @__PURE__ */ Symbol("permessage-deflate");
    var kTotalLength = /* @__PURE__ */ Symbol("total-length");
    var kCallback = /* @__PURE__ */ Symbol("callback");
    var kBuffers = /* @__PURE__ */ Symbol("buffers");
    var kError = /* @__PURE__ */ Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint2 = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint2}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint2}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint2 = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint2}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint2}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module2.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// ../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/validation.js"(exports2, module2) {
    "use strict";
    var { isUtf8 } = require("buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module2.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module2.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = require("utf-8-validate");
        module2.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// ../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/receiver.js"(exports2, module2) {
    "use strict";
    var { Writable } = require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxBufferedChunks = options.maxBufferedChunks | 0;
        this._maxFragments = options.maxFragments | 0;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
          cb(
            this.createError(
              RangeError,
              "Too many buffered chunks",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            )
          );
          return;
        }
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          if (this._maxFragments > 0 && this._fragments.length >= this._maxFragments) {
            const error = this.createError(
              RangeError,
              "Too many message fragments",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            );
            cb(error);
            return;
          }
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            if (this._maxFragments > 0 && this._fragments.length >= this._maxFragments) {
              const error = this.createError(
                RangeError,
                "Too many message fragments",
                false,
                1008,
                "WS_ERR_TOO_MANY_BUFFERED_PARTS"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module2.exports = Receiver2;
  }
});

// ../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/sender.js"(exports2, module2) {
    "use strict";
    var { Duplex } = require("stream");
    var { randomFillSync } = require("crypto");
    var {
      types: { isUint8Array }
    } = require("util");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = /* @__PURE__ */ Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking) return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module2.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// ../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/event-target.js"(exports2, module2) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = /* @__PURE__ */ Symbol("kCode");
    var kData = /* @__PURE__ */ Symbol("kData");
    var kError = /* @__PURE__ */ Symbol("kError");
    var kMessage = /* @__PURE__ */ Symbol("kMessage");
    var kReason = /* @__PURE__ */ Symbol("kReason");
    var kTarget = /* @__PURE__ */ Symbol("kTarget");
    var kType = /* @__PURE__ */ Symbol("kType");
    var kWasClean = /* @__PURE__ */ Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module2.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// ../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/extension.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension2) => {
        let configurations = extensions[extension2];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values)) values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module2.exports = { format, parse };
  }
});

// ../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/websocket.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var https = require("https");
    var http = require("http");
    var net = require("net");
    var tls = require("tls");
    var { randomBytes, createHash: createHash3 } = require("crypto");
    var { Duplex, Readable } = require("stream");
    var { URL: URL2 } = require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var kAborted = /* @__PURE__ */ Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._closeTimeout = options.closeTimeout;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxBufferedChunks: options.maxBufferedChunks,
          maxFragments: options.maxFragments,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function") return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module2.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxBufferedChunks: 1024 * 1024,
        maxFragments: 128 * 1024,
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      websocket._closeTimeout = opts.closeTimeout;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL2) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL2(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL2(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash3("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate2.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxBufferedChunks: opts.maxBufferedChunks,
          maxFragments: opts.maxFragments,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// ../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/stream.js"(exports2, module2) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module2.exports = createWebSocketStream2;
  }
});

// ../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/subprotocol.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module2.exports = { parse };
  }
});

// ../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/websocket-server.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var http = require("http");
    var { Duplex } = require("stream");
    var { createHash: createHash3 } = require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxBufferedChunks=1048576] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=131072] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxBufferedChunks: 1024 * 1024,
          maxFragments: 128 * 1024,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 13 && version !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash3("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate2.extensionName]) {
          const params = extensions[PerMessageDeflate2.extensionName].params;
          const value = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxBufferedChunks: this.options.maxBufferedChunks,
          maxFragments: this.options.maxFragments,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module2.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map)) server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// ../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/esm.mjs
var import_index = __toESM(require_commander(), 1);
var {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError,
  // deprecated old name
  Command,
  Argument,
  Option,
  Help
} = import_index.default;

// src/index.ts
var import_promises8 = require("node:fs/promises");
var import_node_child_process4 = require("node:child_process");
var import_node_path8 = require("node:path");

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys2 = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys2.push(key);
      }
    }
    return keys2;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys2 = util.objectKeys(shape);
    this._cached = { shape, keys: keys2 };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = /* @__PURE__ */ Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// ../core/dist/model/schemas.js
var SchemaVersion = 1;
function enumWithFallback(values, fallback) {
  return external_exports.preprocess((value) => {
    if (typeof value !== "string")
      return fallback;
    return values.includes(value) ? value : fallback;
  }, external_exports.enum(values));
}
var ProviderKindSchema = enumWithFallback(["openrouter", "openai", "anthropic", "customOpenAICompatible", "codexCli", "claudeCode", "opencode"], "openrouter");
var ReasoningEffortSchema = enumWithFallback(["none", "low", "medium", "high"], "none");
var AgentRoleSchema = external_exports.object({
  provider: ProviderKindSchema,
  model: external_exports.string().min(1),
  reasoningEffort: ReasoningEffortSchema.default("none")
});
var ProtocolLockSchema = external_exports.object({
  researchQuestion: external_exports.string(),
  scope: external_exports.string().default(""),
  plannedObservables: external_exports.array(external_exports.string()).default([]),
  successCriteria: external_exports.array(external_exports.string()).default([]),
  falsificationCriteria: external_exports.array(external_exports.string()).default([]),
  requiredEvidence: external_exports.array(external_exports.string()).default([]),
  exclusions: external_exports.array(external_exports.string()).default([]),
  lockedAt: external_exports.string().optional()
});
var ProtocolAmendmentSchema = external_exports.object({
  id: external_exports.string(),
  title: external_exports.string(),
  rationale: external_exports.string(),
  status: enumWithFallback(["proposed", "approved", "rejected"], "proposed"),
  createdAt: external_exports.string()
});
var SourceActivitySchema = external_exports.object({
  id: external_exports.string(),
  type: enumWithFallback(["execution", "literatureImport", "userInput", "protocolLock", "methodRegistration", "manualDatasetImport", "legacyImport"], "legacyImport"),
  title: external_exports.string(),
  startedAt: external_exports.string(),
  finishedAt: external_exports.string().optional(),
  actorType: enumWithFallback(["system", "user", "agent", "cli"], "system"),
  actorId: external_exports.string().optional(),
  relatedTaskId: external_exports.string().optional(),
  agentRunResultId: external_exports.string().optional(),
  userActionId: external_exports.string().optional()
});
var ProjectManifestSchema = external_exports.object({
  schemaVersion: external_exports.literal(SchemaVersion).default(SchemaVersion),
  name: external_exports.string(),
  question: external_exports.string(),
  roles: external_exports.object({
    planner: AgentRoleSchema,
    executor: AgentRoleSchema,
    reviewer: AgentRoleSchema
  }),
  settings: external_exports.object({
    maxLanes: external_exports.number().int().positive().default(3),
    maxNodes: external_exports.number().int().positive().optional(),
    depth: enumWithFallback(["quick", "standard", "deep"], "standard"),
    sandboxPolicy: enumWithFallback(["required", "prefer", "disabled"], "required"),
    selfCorrectionRounds: external_exports.number().int().min(1).max(5).default(2)
  }),
  protocolLock: ProtocolLockSchema.optional(),
  amendments: external_exports.array(ProtocolAmendmentSchema).default([])
});
var PlanSchema = external_exports.object({
  id: external_exports.string(),
  title: external_exports.string(),
  purpose: external_exports.string(),
  method: external_exports.string(),
  observables: external_exports.array(external_exports.string()).default([]),
  successCriteria: external_exports.array(external_exports.string()).default([]),
  falsificationCriteria: external_exports.array(external_exports.string()).default([]),
  approved: external_exports.boolean().default(false)
});
var LaneSchema = external_exports.object({
  id: external_exports.string(),
  name: external_exports.string(),
  planId: external_exports.string(),
  nodeOrder: external_exports.array(external_exports.string()).default([])
});
var NodeExecutionRecordSchema = external_exports.object({
  exitCode: external_exports.number().int().nullable(),
  startedAt: external_exports.string(),
  durationMs: external_exports.number().nonnegative(),
  backend: enumWithFallback(["pyodide", "sandboxExec", "docker"], "pyodide")
});
var NodeReviewSchema = external_exports.object({
  severity: enumWithFallback(["clear", "info", "warning", "critical"], "info"),
  findings: external_exports.array(external_exports.string()).default([]),
  concerns: external_exports.array(external_exports.string()).default([]),
  summary: external_exports.string().default("")
});
var NodeRecordSchema = external_exports.object({
  id: external_exports.string(),
  title: external_exports.string(),
  status: enumWithFallback(["notStarted", "running", "completed", "error", "waitingForUser", "settled"], "notStarted"),
  prerequisiteNodeIds: external_exports.array(external_exports.string()).default([]),
  generatedCode: external_exports.string().default(""),
  executionRecord: NodeExecutionRecordSchema.optional(),
  review: NodeReviewSchema.optional(),
  reproducibility: enumWithFallback(["notChecked", "reproduced", "divergent", "failed"], "notChecked").default("notChecked")
});
var LiteratureStatusSchema = enumWithFallback(["unverified", "verified", "importedByUser", "needsCitation", "rejected", "retracted"], "unverified");
var LiteratureItemSchema = external_exports.object({
  id: external_exports.string(),
  title: external_exports.string(),
  authors: external_exports.string().default(""),
  year: external_exports.string().default(""),
  doi: external_exports.string().optional(),
  url: external_exports.string().optional(),
  citationKey: external_exports.string(),
  status: LiteratureStatusSchema.default("unverified"),
  notes: external_exports.string().default("")
});
var SupportRefSchema = external_exports.object({
  targetType: enumWithFallback(["evidence", "citation", "method", "protocol", "review"], "evidence"),
  targetId: external_exports.string(),
  role: enumWithFallback(["primary", "secondary", "method", "background", "limitation", "contradiction", "provenance"], "secondary"),
  validation: enumWithFallback(["valid", "invalid", "stale", "missing"], "missing")
});
var EvidenceBaseSchema = external_exports.object({
  id: external_exports.string(),
  type: enumWithFallback(["execution", "dataset", "plot", "table", "log", "humanInput", "manualDataset", "method", "protocol"], "log"),
  laneId: external_exports.string().optional(),
  nodeId: external_exports.string().optional(),
  title: external_exports.string(),
  summary: external_exports.string().default(""),
  path: external_exports.string().optional(),
  sha256: external_exports.string().optional(),
  createdAt: external_exports.string(),
  sourceActivityId: external_exports.string(),
  sourceActivityType: enumWithFallback(["execution", "literatureImport", "userInput", "protocolLock", "methodRegistration", "manualDatasetImport", "legacyImport"], "legacyImport").default("legacyImport"),
  validation: enumWithFallback(["valid", "invalid", "stale", "missing"], "missing"),
  review: enumWithFallback(["draft", "needsRevision", "approved", "rejected"], "draft")
});
var ExecutionEvidencePayloadSchema = external_exports.object({
  producingCommand: external_exports.string(),
  exitCode: external_exports.number().int(),
  stdoutPath: external_exports.string(),
  stderrPath: external_exports.string(),
  artifactPaths: external_exports.array(external_exports.string()).default([]),
  sha256ByPath: external_exports.record(external_exports.string()).default({}),
  environmentSummary: external_exports.string().default("")
});
var EvidenceItemSchema = EvidenceBaseSchema.extend({
  execution: ExecutionEvidencePayloadSchema.optional()
}).superRefine((item, ctx) => {
  if (item.type === "execution" && !item.execution) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      path: ["execution"],
      message: "execution evidence requires an execution payload"
    });
  }
});
var ClaimSchema = external_exports.object({
  id: external_exports.string(),
  text: external_exports.string(),
  type: enumWithFallback(["result", "background", "methodological", "limitation", "interpretation"], "interpretation"),
  supportRefs: external_exports.array(SupportRefSchema).default([]),
  validation: enumWithFallback(["valid", "invalid", "stale", "missing"], "missing"),
  review: enumWithFallback(["draft", "needsRevision", "approved", "rejected"], "draft"),
  intendedSectionId: external_exports.string().optional(),
  appliedSectionId: external_exports.string().optional(),
  qmdPatchIds: external_exports.array(external_exports.string()).default([])
});
var BlockingMarkerSchema = enumWithFallback(["executionNeeded", "citationNeeded", "dataNeeded", "userInputNeeded", "unresolvedCriticalReview", "missingArtifact", "staleSupportRef"], "userInputNeeded");
var PatchWarningSchema = external_exports.object({
  message: external_exports.string(),
  blocking: external_exports.boolean().default(false),
  supportRefIds: external_exports.array(external_exports.string()).default([])
});
var PatchSchema = external_exports.object({
  id: external_exports.string(),
  targetSection: external_exports.string(),
  operation: enumWithFallback(["insert", "replace", "append", "delete"], "replace"),
  baseHash: external_exports.string(),
  newBody: external_exports.string(),
  warnings: external_exports.array(PatchWarningSchema).default([]),
  blockingMarkers: external_exports.array(BlockingMarkerSchema).default([]),
  supportRefs: external_exports.array(SupportRefSchema).default([]),
  claimIds: external_exports.array(external_exports.string()).default([]),
  status: enumWithFallback(["draft", "needsRevision", "approved", "rejected"], "draft"),
  appliedAt: external_exports.string().optional()
});
var MethodItemSchema = external_exports.object({
  id: external_exports.string(),
  title: external_exports.string(),
  summary: external_exports.string().default(""),
  path: external_exports.string().optional()
});
var NodeSummarySchema = external_exports.object({
  id: external_exports.string(),
  status: enumWithFallback(["notStarted", "running", "completed", "error", "waitingForUser", "settled"], "notStarted"),
  reviewSeverity: enumWithFallback(["clear", "info", "warning", "critical"], "info").optional(),
  reproducibilityStatus: enumWithFallback(["notChecked", "reproduced", "divergent", "failed"], "notChecked").optional()
});
var AgentRunResultSchema = external_exports.object({
  id: external_exports.string(),
  runStatus: enumWithFallback(["succeeded", "failed", "cancelled", "blockedInvalidSchema"], "failed"),
  exitCode: external_exports.number().int().nullable(),
  structuredResultPath: external_exports.string().optional(),
  declaredSchemaPath: external_exports.string().optional(),
  schemaValidationStatus: enumWithFallback(["valid", "invalid", "missing", "notApplicable"], "notApplicable"),
  stdoutPath: external_exports.string(),
  stderrPath: external_exports.string(),
  createdFiles: external_exports.array(external_exports.string()).default([]),
  modifiedFiles: external_exports.array(external_exports.string()).default([]),
  deletedFiles: external_exports.array(external_exports.string()).default([]),
  sha256ByPath: external_exports.record(external_exports.string()).default({}),
  gitDiffPath: external_exports.string(),
  artifactManifestStatus: enumWithFallback(["valid", "partial", "missing", "invalid"], "missing"),
  artifactManifest: external_exports.unknown().optional(),
  startedAt: external_exports.string(),
  finishedAt: external_exports.string()
});

// ../core/dist/gates/numericGrounding.js
var scannableExtensions = /* @__PURE__ */ new Set(["csv", "tsv", "json", "txt", "log", "md", "dat"]);
var floatLikePattern = /[-+]?(?:\d+(?:\.\d+)?[eE][-+]?\d+|\d+\.\d+)(?:%)?|(?<![\d.eE+-])\d+%/g;
var integerPattern = /(?<![\d.eE+-])\d{2,}(?![\d.eE+-])/g;
var artifactNumberPattern = /[-+]?(?:\d+(?:\.\d+)?[eE][-+]?\d+|\d+\.\d+|\d+)(?:%)?/g;
function stripCodeFences(markdown) {
  return markdown.replace(/```[\s\S]*?```/g, "");
}
function targetSectionText(markdown) {
  const text = stripCodeFences(markdown);
  const lines = text.split(/\r?\n/);
  const selected = [];
  let include = false;
  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (heading) {
      const title = normalizeHeading(heading[2] ?? "");
      include = title === "abstract" || title === "results" || title === "result" || title === "discussion";
      continue;
    }
    if (include)
      selected.push(line);
  }
  return selected.join("\n");
}
function normalizeHeading(value) {
  return value.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim();
}
function significantNumbers(text) {
  return Array.from(stripCodeFences(text).matchAll(floatLikePattern), (match) => match[0]);
}
function significantIntegers(text) {
  const integers = Array.from(stripCodeFences(text).matchAll(integerPattern), (match) => match[0]);
  return integers.filter((value) => {
    const number = Number(value);
    return Number.isFinite(number) && !(number >= 1900 && number <= 2099);
  });
}
function groundingReport(body, artifactTexts, options = {}) {
  const checkedText = options.scope === "full" ? stripCodeFences(body) : targetSectionText(body);
  const numbers = unique(significantNumbers(checkedText));
  const integers = unique(significantIntegers(checkedText));
  const artifactValues = parseArtifactValues(artifactTexts);
  const artifactIntegers = parseArtifactIntegers(artifactTexts);
  const ungroundedNumbers = numbers.filter((value) => !isGroundedNumber(value, artifactValues));
  const ungroundedIntegers = integers.filter((value) => {
    if (artifactIntegers.has(value))
      return false;
    const numeric = Number(value);
    return !artifactValues.some((candidate) => candidate === numeric);
  });
  return {
    checkedNumbers: numbers,
    ungroundedNumbers,
    checkedIntegers: integers,
    ungroundedIntegers
  };
}
function isScannablePath(path) {
  if (!path)
    return false;
  const extension2 = path.split(".").pop()?.toLowerCase();
  return extension2 ? scannableExtensions.has(extension2) : false;
}
function parseArtifactValues(artifactTexts) {
  const values = [];
  artifactTexts = artifactTexts.map((text) => text.replace(/(\d),(?=\d{3}\b)/g, "$1"));
  for (const text of artifactTexts) {
    for (const match of text.matchAll(artifactNumberPattern)) {
      const parsed = parseNumericToken(match[0]);
      if (Number.isFinite(parsed))
        values.push(parsed);
    }
  }
  return values;
}
function parseArtifactIntegers(artifactTexts) {
  const values = /* @__PURE__ */ new Set();
  for (const text of artifactTexts) {
    for (const value of significantIntegers(text))
      values.add(value);
  }
  return values;
}
function isGroundedNumber(token, artifactValues) {
  const percent = token.endsWith("%");
  const bodyValue = parseNumericToken(token);
  if (!Number.isFinite(bodyValue))
    return false;
  const candidates = percent ? [bodyValue, bodyValue / 100] : [bodyValue];
  return candidates.some((candidate) => artifactValues.some((artifactValue) => numericallyEquivalent(candidate, artifactValue, decimalPlacesFor(token, percent))));
}
function parseNumericToken(token) {
  const trimmed = token.trim();
  const isPercent = trimmed.endsWith("%");
  const raw = isPercent ? trimmed.slice(0, -1) : trimmed;
  const value = Number(raw);
  return Number.isFinite(value) ? value : Number.NaN;
}
function decimalPlacesFor(token, percent) {
  const raw = percent ? token.slice(0, -1) : token;
  const exponentMatch = /e[-+]?\d+$/i.exec(raw);
  const mantissa = exponentMatch ? raw.slice(0, exponentMatch.index) : raw;
  const dot = mantissa.indexOf(".");
  if (dot < 0)
    return 0;
  const places = Math.min(mantissa.length - dot - 1, 12);
  return percent ? Math.min(places + 2, 12) : places;
}
function numericallyEquivalent(bodyValue, artifactValue, decimalPlaces) {
  const roundedArtifact = roundTo(artifactValue, decimalPlaces);
  const roundedBody = roundTo(bodyValue, decimalPlaces);
  const tolerance = 0.5 * Math.pow(10, -Math.max(decimalPlaces, 0)) + Number.EPSILON;
  return Math.abs(roundedArtifact - roundedBody) <= tolerance;
}
function roundTo(value, decimalPlaces) {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
function unique(values) {
  return Array.from(new Set(values));
}

// ../core/dist/gates/citations.js
var stopWords = /* @__PURE__ */ new Set([
  "a",
  "an",
  "and",
  "for",
  "in",
  "is",
  "of",
  "on",
  "the",
  "to",
  "with"
]);
var authorFillers = /* @__PURE__ */ new Set(["et", "al", "and", "others"]);
function normalizeDoi(doi) {
  return doi.trim().toLowerCase().replace(/^https?:\/\/(?:dx\.)?doi\.org\//, "").replace(/^doi:\s*/, "");
}
function titleTokens(title) {
  return title.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((token) => token.length > 0 && !stopWords.has(token));
}
function titlesMatch(left, right) {
  const leftTokens = new Set(titleTokens(left));
  const rightTokens = new Set(titleTokens(right));
  if (leftTokens.size === 0 || rightTokens.size === 0)
    return false;
  const overlap = intersectionSize(leftTokens, rightTokens);
  const dice = 2 * overlap / (leftTokens.size + rightTokens.size);
  const ratio = Math.min(leftTokens.size, rightTokens.size) / Math.max(leftTokens.size, rightTokens.size);
  return dice >= 0.75 && ratio >= 0.5;
}
function familyNames(authorText) {
  return authorText.split(/[,;]|(?:\s+and\s+)/i).map((chunk) => chunk.toLowerCase().replace(/[^\p{L}\s-]/gu, " ").split(/\s+/).filter((part) => part.length > 0 && !authorFillers.has(part))).map((parts) => parts.at(-1)).filter((part) => Boolean(part));
}
function authorFamilyNamesOverlap(left, right) {
  const leftNames = new Set(familyNames(left));
  const rightNames = new Set(familyNames(right));
  return intersectionSize(leftNames, rightNames) > 0;
}
function isAllowedCitation(item) {
  if (item.status === "verified")
    return true;
  return item.status === "importedByUser" && Boolean(item.doi || item.url);
}
async function verifyLiteratureItem(item, options = {}) {
  if (!item.doi) {
    if (item.status === "importedByUser" && item.url)
      return item;
    return { ...item, status: item.status === "rejected" ? "rejected" : "unverified" };
  }
  const fetchImpl = options.fetchImpl ?? fetch;
  const doi = normalizeDoi(item.doi);
  let response;
  try {
    response = await fetchImpl(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
  } catch {
    return item;
  }
  if (response.status === 404)
    return { ...item, doi, status: "rejected" };
  if (!response.ok)
    return item;
  const body = await response.json();
  const work = body.message;
  if (hasRetractionSignal(work.relation))
    return { ...item, doi, status: "retracted" };
  const crossrefTitle = work.title?.[0] ?? "";
  const crossrefAuthors = (work.author ?? []).map((author) => author.family ?? "").filter(Boolean).join(", ");
  const crossrefYear = String(work.published?.["date-parts"]?.[0]?.[0] ?? work.issued?.["date-parts"]?.[0]?.[0] ?? "");
  const titleOK = titlesMatch(item.title, crossrefTitle);
  const authorsOK = item.authors.trim().length === 0 || authorFamilyNamesOverlap(item.authors, crossrefAuthors);
  const yearOK = item.year.trim().length === 0 || crossrefYear.length === 0 || Math.abs(Number(item.year) - Number(crossrefYear)) <= 1;
  return {
    ...item,
    doi,
    status: titleOK && authorsOK && yearOK ? "verified" : "rejected"
  };
}
function hasRetractionSignal(relation) {
  return /retraction|withdrawal|removal/i.test(JSON.stringify(relation ?? {}));
}
function intersectionSize(left, right) {
  let count = 0;
  for (const value of left) {
    if (right.has(value))
      count += 1;
  }
  return count;
}

// ../core/dist/gates/evidence.js
var import_node_crypto = require("node:crypto");
function citationKeys(markdown) {
  const keys2 = /* @__PURE__ */ new Set();
  const bracketPattern = /\[@([A-Za-z][A-Za-z0-9_.:\-]*)(?:[;\]\s])/g;
  const barePattern = /(?<![\w.-])@([A-Za-z][A-Za-z0-9_.:\-]*)\b/g;
  for (const match of markdown.matchAll(bracketPattern)) {
    if (match[1])
      keys2.add(cleanCitationKey(match[1]));
  }
  for (const match of markdown.matchAll(barePattern)) {
    const key = match[1];
    if (!key || looksLikeEmail(markdown, match.index ?? 0))
      continue;
    keys2.add(cleanCitationKey(key));
  }
  return Array.from(keys2).filter((key) => key.length > 0);
}
function cleanCitationKey(key) {
  return key.replace(/[;\],.]+$/g, "");
}
function looksLikeEmail(text, atIndex) {
  const before = text.slice(Math.max(0, atIndex - 64), atIndex);
  const after = text.slice(atIndex + 1, atIndex + 65);
  return /[\w.+-]+$/.test(before) && /^[\w.-]+\.[A-Za-z]{2,}/.test(after);
}
var sectionGroups = [
  ["abstract", "\u8981\u65E8", "\u6982\u8981"],
  ["introduction", "background", "\u80CC\u666F", "\u5E8F\u8AD6", "\u306F\u3058\u3081\u306B"],
  ["methods", "method", "\u65B9\u6CD5", "\u624B\u6CD5"],
  ["results", "result", "\u7D50\u679C"],
  ["discussion", "\u8003\u5BDF", "\u8B70\u8AD6"],
  ["limitations", "limitation", "\u9650\u754C", "\u5236\u9650"],
  ["data/code availability", "data availability", "code availability", "references", "citation", "\u518D\u73FE", "\u30C7\u30FC\u30BF", "\u30B3\u30FC\u30C9", "\u53C2\u8003\u6587\u732E"]
];
var blockingMarkerText = {
  executionNeeded: "[execution needed]",
  citationNeeded: "[citation needed]",
  dataNeeded: "[data needed]",
  userInputNeeded: "[user input needed]",
  unresolvedCriticalReview: "[unresolved critical review]",
  missingArtifact: "[missing artifact]",
  staleSupportRef: "[stale supportref]"
};
function evidenceById(project, targetId) {
  return project.evidence.find((item) => item.id === targetId || item.path === targetId || item.nodeId === targetId);
}
function literatureByTarget(project, targetId) {
  return project.literature.find((item) => item.id === targetId || item.citationKey === targetId);
}
function citationIsAllowed(project, targetId) {
  const item = literatureByTarget(project, targetId);
  return item ? isAllowedCitation(item) : false;
}
function isSupportRefValid(ref, project) {
  if (ref.validation !== "valid")
    return false;
  switch (ref.targetType) {
    case "evidence": {
      const evidence = evidenceById(project, ref.targetId);
      return Boolean(evidence && evidence.validation === "valid" && evidence.review !== "rejected");
    }
    case "citation":
      return citationIsAllowed(project, ref.targetId);
    case "method":
      return Boolean(project.methods?.some((method) => method.id === ref.targetId || method.title === ref.targetId));
    case "protocol":
      return Boolean(project.protocolLock && (ref.targetId === "protocol" || project.protocolLock.researchQuestion === ref.targetId));
    case "review":
      return Boolean(project.nodes?.some((node) => node.id === ref.targetId && node.reviewSeverity !== void 0));
  }
}
function isSuccessfulExecutionEvidence(ref, project) {
  if (ref.targetType !== "evidence")
    return false;
  const evidence = evidenceById(project, ref.targetId);
  return Boolean(evidence && evidence.validation === "valid" && evidence.review !== "rejected" && evidence.type === "execution" && evidence.execution?.exitCode === 0);
}
function claimCanEnterManuscript(claim, project) {
  if (claim.validation !== "valid" || claim.review !== "approved" || claim.supportRefs.length === 0)
    return false;
  if (!claim.supportRefs.every((ref) => isSupportRefValid(ref, project)))
    return false;
  switch (claim.type) {
    case "result":
      return claim.supportRefs.some((ref) => ref.role === "primary" && isSuccessfulExecutionEvidence(ref, project));
    case "background":
      return claim.supportRefs.some((ref) => ref.targetType === "citation" && citationIsAllowed(project, ref.targetId));
    case "methodological":
      return claim.supportRefs.some((ref) => ref.role === "method" || ref.targetType === "method" || ref.targetType === "protocol" || isSuccessfulExecutionEvidence(ref, project));
    case "limitation":
    case "interpretation":
      return true;
  }
}
function blockingMarkers(markdown) {
  const normalized = markdown.toLowerCase();
  return Object.entries(blockingMarkerText).filter(([, marker]) => normalized.includes(marker)).map(([type]) => type);
}
function internalOutputLeakTerms(markdown) {
  const normalized = markdown.toLowerCase();
  const leaks = [
    "claim_id",
    "evidence_id",
    "qmdpatch",
    "qmd patch",
    "agent timeline",
    "agent run",
    "harness",
    "node.qmd",
    "sourceactivity",
    "supportref"
  ].filter((term) => normalized.includes(term));
  const idPattern = /\b(?:node|lane|patch|run|agent-run|researcher)-[0-9a-f]{8}[0-9a-f-]*\b/gi;
  for (const match of new Set(normalized.match(idPattern) ?? [])) {
    leaks.push(match);
  }
  return leaks;
}
function markdownHeaderTitles(markdown) {
  const titles = [];
  let insideCodeFence = false;
  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith("```")) {
      insideCodeFence = !insideCodeFence;
      continue;
    }
    if (insideCodeFence || !line.startsWith("#"))
      continue;
    const title = line.replace(/^#+/, "").trim().toLowerCase();
    if (title)
      titles.push(title);
  }
  return titles;
}
function foundSectionCount(markdown) {
  const titles = markdownHeaderTitles(markdown);
  if (titles.length === 0)
    return 0;
  return sectionGroups.filter((group) => group.some((keyword) => titles.some((title) => title.includes(keyword)))).length;
}
function normalizedTextHash(markdown) {
  const normalized = markdown.replace(/\r\n/g, "\n").split("\n").map((line) => line.replace(/[ \t]+$/g, "")).join("\n").trim();
  return (0, import_node_crypto.createHash)("sha256").update(normalized).digest("hex");
}
function patchCanApply(patch) {
  return patch.status === "approved" && patch.blockingMarkers.length === 0 && !patch.warnings.some((warning) => warning.blocking);
}
function applyPatchIfValid(currentBody, patch) {
  if (!patchCanApply(patch))
    return { applied: false, body: currentBody, reason: "patch is not approved or has blocking issues" };
  if (patch.baseHash !== normalizedTextHash(currentBody))
    return { applied: false, body: currentBody, reason: "base hash mismatch" };
  switch (patch.operation) {
    case "replace":
      return { applied: true, body: patch.newBody };
    case "append":
      return { applied: true, body: `${currentBody.trimEnd()}

${patch.newBody}` };
    case "insert":
      return { applied: true, body: `${patch.newBody}

${currentBody.trimStart()}` };
    case "delete":
      return { applied: true, body: "" };
  }
}
function stageManuscriptPatch(project, newBody, options = {}) {
  const eligibleClaims = project.claims.filter((claim) => claimCanEnterManuscript(claim, project));
  const supportRefs = eligibleClaims.flatMap((claim) => claim.supportRefs);
  const invalidRefs = supportRefs.filter((ref) => !isSupportRefValid(ref, project));
  const markers = blockingMarkers(newBody);
  const leaks = internalOutputLeakTerms(newBody);
  const artifactTexts = options.artifactTexts ?? project.evidence.filter((evidence) => evidence.validation === "valid" && evidence.review !== "rejected" && isScannablePath(evidence.path)).map((evidence) => evidence.summary);
  const numeric = groundingReport(newBody, artifactTexts, { scope: "full" });
  const unverifiedKeys = citationKeys(newBody).filter((key) => !citationIsAllowed(project, key));
  const warnings = [
    ...invalidRefs.map((ref) => ({
      message: `Invalid support reference: ${ref.targetType}/${ref.targetId}`,
      blocking: true,
      supportRefIds: [ref.targetId]
    })),
    ...leaks.map((term) => ({ message: `Internal term would leak into the final body: ${term}`, blocking: true, supportRefIds: [] })),
    ...numeric.ungroundedNumbers.map((value) => ({ message: `Number not traceable to any execution artifact: ${value}`, blocking: true, supportRefIds: [] })),
    ...numeric.ungroundedIntegers.map((value) => ({ message: `Integer not traceable to any execution artifact (advisory): ${value}`, blocking: false, supportRefIds: [] })),
    ...unverifiedKeys.map((key) => ({ message: `Citation key is not verified: @${key}`, blocking: true, supportRefIds: [] }))
  ];
  const clean = markers.length === 0 && !warnings.some((warning) => warning.blocking);
  return {
    id: cryptoRandomId(),
    targetSection: "document",
    operation: options.operation ?? "replace",
    baseHash: normalizedTextHash(project.manuscriptBody),
    newBody,
    warnings,
    blockingMarkers: markers,
    supportRefs,
    claimIds: eligibleClaims.map((claim) => claim.id),
    status: options.autoApprove && clean ? "approved" : clean ? "draft" : "needsRevision"
  };
}
function readinessReport(project, depth, io = {}) {
  const body = project.manuscriptBody.trim();
  const report = {
    blankBody: body.length === 0,
    foundSections: 0,
    requiredSections: sectionGroups.length,
    supportedClaims: 0,
    totalNodeCount: project.nodes?.length ?? 0,
    reviewedNodeCount: 0,
    openMarkers: 0,
    criticalCount: 0,
    executableErrorCount: 0,
    staleSupportRefCount: 0,
    orphanResultClaimCount: 0,
    approvedUnappliedPatchCount: 0,
    pendingPatchCount: 0,
    rejectedClaimPatchCount: 0,
    missingArtifactCount: 0,
    unverifiedCitationRefCount: 0,
    internalLeakTerms: [],
    unapprovedAmendmentCount: 0,
    ungroundedResultNumbers: [],
    ungroundedIntegers: [],
    irreproducibleNodeCount: 0,
    readinessScore: 0,
    ready: false
  };
  if (report.blankBody)
    return report;
  const normalized = body.toLowerCase();
  report.foundSections = foundSectionCount(body);
  report.openMarkers = blockingMarkers(body).reduce((count, marker) => count + occurrenceCount(blockingMarkerText[marker] ?? "", normalized), 0);
  report.reviewedNodeCount = project.nodes?.filter((node) => node.reviewSeverity !== void 0).length ?? 0;
  report.criticalCount = project.nodes?.filter((node) => node.reviewSeverity === "critical").length ?? 0;
  report.executableErrorCount = project.nodes?.filter((node) => node.status === "error").length ?? 0;
  report.supportedClaims = project.claims.filter((claim) => claimCanEnterManuscript(claim, project)).length;
  const allSupportRefs = [...project.claims.flatMap((claim) => claim.supportRefs), ...(project.patches ?? []).flatMap((patch) => patch.supportRefs)];
  report.staleSupportRefCount = allSupportRefs.filter((ref) => ref.validation === "stale" || !isSupportRefValid(ref, project)).length;
  report.orphanResultClaimCount = project.claims.filter((claim) => claim.type === "result" && !claim.supportRefs.some((ref) => ref.role === "primary" && isSuccessfulExecutionEvidence(ref, project))).length;
  report.approvedUnappliedPatchCount = (project.patches ?? []).filter((patch) => patch.status === "approved" && !patch.appliedAt).length;
  report.pendingPatchCount = (project.patches ?? []).filter((patch) => (patch.status === "draft" || patch.status === "needsRevision") && !patch.appliedAt).length;
  report.rejectedClaimPatchCount = (project.patches ?? []).filter((patch) => patch.claimIds.some((claimId) => project.claims.find((claim) => claim.id === claimId)?.review === "rejected")).length;
  report.missingArtifactCount = project.evidence.filter((evidence) => evidence.validation === "valid" && Boolean(evidence.path) && !(io.artifactExists?.(evidence) ?? true)).length;
  report.unverifiedCitationRefCount = allSupportRefs.filter((ref) => ref.targetType === "citation" && !citationIsAllowed(project, ref.targetId)).length;
  report.internalLeakTerms = internalOutputLeakTerms(body);
  report.unapprovedAmendmentCount = (project.amendments ?? []).filter((amendment) => amendment.status !== "approved").length;
  const artifactTexts = project.evidence.filter((evidence) => evidence.validation === "valid" && evidence.review !== "rejected" && isScannablePath(evidence.path)).map((evidence) => io.artifactText?.(evidence) ?? evidence.summary).filter((text) => text.length > 0);
  const numeric = groundingReport(body, artifactTexts);
  report.ungroundedResultNumbers = numeric.ungroundedNumbers;
  report.ungroundedIntegers = numeric.ungroundedIntegers;
  report.irreproducibleNodeCount = project.nodes?.filter((node) => node.reproducibilityStatus === "divergent" || node.reproducibilityStatus === "failed").length ?? 0;
  const config = depthConfig(depth);
  const sectionScore = report.foundSections / report.requiredSections;
  const evidenceScore = Math.min(1, Math.max(report.supportedClaims, report.reviewedNodeCount) / Math.max(1, config.minimumEvidenceNodes));
  const deterministicIssues = report.openMarkers + report.staleSupportRefCount + report.orphanResultClaimCount + report.approvedUnappliedPatchCount + report.pendingPatchCount + report.rejectedClaimPatchCount + report.missingArtifactCount + report.unverifiedCitationRefCount + report.internalLeakTerms.length + report.unapprovedAmendmentCount + report.ungroundedResultNumbers.length + report.irreproducibleNodeCount;
  const weightedIssues = deterministicIssues + 0.5 * report.ungroundedIntegers.length;
  const openIssueScore = Math.max(0, 1 - weightedIssues / Math.max(1, config.allowedOpenIssueMarkers + 1));
  const reviewScore = report.criticalCount > 0 ? 0 : report.executableErrorCount > 0 ? 0.45 : 1;
  report.readinessScore = sectionScore * 0.45 + evidenceScore * 0.25 + openIssueScore * 0.2 + reviewScore * 0.1;
  const enoughEvidence = report.totalNodeCount >= config.minimumEvidenceNodes || report.supportedClaims >= config.minimumEvidenceNodes;
  report.ready = enoughEvidence && report.readinessScore + Number.EPSILON >= config.targetReadinessScore && deterministicIssues <= config.allowedOpenIssueMarkers && report.criticalCount === 0 && report.executableErrorCount === 0 && report.staleSupportRefCount === 0 && report.orphanResultClaimCount === 0 && report.approvedUnappliedPatchCount === 0 && report.pendingPatchCount === 0 && report.rejectedClaimPatchCount === 0 && report.missingArtifactCount === 0 && report.unverifiedCitationRefCount === 0 && report.internalLeakTerms.length === 0 && report.unapprovedAmendmentCount === 0 && report.ungroundedResultNumbers.length === 0 && report.irreproducibleNodeCount === 0 && report.foundSections >= Math.min(report.requiredSections, depth === "quick" ? 5 : 6);
  return report;
}
function occurrenceCount(needle, haystack) {
  if (needle.length === 0)
    return 0;
  return haystack.split(needle).length - 1;
}
function depthConfig(depth) {
  switch (depth) {
    case "quick":
      return { minimumEvidenceNodes: 1, allowedOpenIssueMarkers: 0, targetReadinessScore: 0.7 };
    case "deep":
      return { minimumEvidenceNodes: 3, allowedOpenIssueMarkers: 0, targetReadinessScore: 0.9 };
    case "standard":
      return { minimumEvidenceNodes: 2, allowedOpenIssueMarkers: 0, targetReadinessScore: 0.8 };
  }
}
function cryptoRandomId() {
  return (0, import_node_crypto.randomUUID)();
}

// ../core/dist/gates/verifyContract.js
var VERIFY_SCHEMA_VERSION = 1;
var ReadinessReportSchema = external_exports.object({
  blankBody: external_exports.boolean(),
  foundSections: external_exports.number(),
  requiredSections: external_exports.number(),
  supportedClaims: external_exports.number(),
  totalNodeCount: external_exports.number(),
  reviewedNodeCount: external_exports.number(),
  openMarkers: external_exports.number(),
  criticalCount: external_exports.number(),
  executableErrorCount: external_exports.number(),
  staleSupportRefCount: external_exports.number(),
  orphanResultClaimCount: external_exports.number(),
  approvedUnappliedPatchCount: external_exports.number(),
  pendingPatchCount: external_exports.number(),
  rejectedClaimPatchCount: external_exports.number(),
  missingArtifactCount: external_exports.number(),
  unverifiedCitationRefCount: external_exports.number(),
  internalLeakTerms: external_exports.array(external_exports.string()),
  unapprovedAmendmentCount: external_exports.number(),
  ungroundedResultNumbers: external_exports.array(external_exports.string()),
  ungroundedIntegers: external_exports.array(external_exports.string()),
  irreproducibleNodeCount: external_exports.number(),
  readinessScore: external_exports.number(),
  ready: external_exports.boolean()
}).strict();
var VerifyGateSchema = external_exports.enum(["numbers", "citations", "repro", "all"]);
var VerifyResultSchema = external_exports.object({
  schemaVersion: external_exports.literal(1),
  ok: external_exports.boolean(),
  gate: VerifyGateSchema,
  readiness: ReadinessReportSchema,
  failures: external_exports.array(external_exports.string())
}).strict();
function verifyGateStatus(gate, report) {
  switch (gate) {
    case "numbers":
      return { ok: report.ungroundedResultNumbers.length === 0, failures: report.ungroundedResultNumbers };
    case "citations":
      return { ok: report.unverifiedCitationRefCount === 0, failures: report.unverifiedCitationRefCount === 0 ? [] : [`${report.unverifiedCitationRefCount} unverified citation reference(s)`] };
    case "repro":
      return { ok: report.irreproducibleNodeCount === 0, failures: report.irreproducibleNodeCount === 0 ? [] : [`${report.irreproducibleNodeCount} irreproducible node(s)`] };
    case "all":
      return { ok: report.ready, failures: report.ready ? [] : ["readiness failed"] };
  }
}
function buildVerifyResult(gate, report) {
  const status = verifyGateStatus(gate, report);
  return VerifyResultSchema.parse({
    schemaVersion: VERIFY_SCHEMA_VERSION,
    ok: status.ok,
    gate,
    readiness: report,
    failures: status.failures
  });
}

// ../core/dist/providers/streamParser.js
var AITruncationError = class extends Error {
  finishReason;
  constructor(finishReason) {
    super(`AI output was truncated: ${finishReason}`);
    this.name = "AITruncationError";
    this.finishReason = finishReason;
  }
};
function assertNotTruncated(finishReason) {
  if (finishReason === "length" || finishReason === "max_tokens") {
    throw new AITruncationError(finishReason);
  }
}
var OpenAIUsageSchema = external_exports.object({
  prompt_tokens: external_exports.number().optional(),
  completion_tokens: external_exports.number().optional(),
  completion_tokens_details: external_exports.object({
    reasoning_tokens: external_exports.number().optional()
  }).optional()
});
var StreamParser = class {
  dialect;
  text = "";
  reasoning = "";
  usage;
  finishReason;
  isDone = false;
  constructor(dialect) {
    this.dialect = dialect;
  }
  consumeLine(line) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith(":"))
      return [];
    if (!trimmed.startsWith("data:"))
      return [];
    const payload = trimmed.slice("data:".length).trim();
    if (payload === "[DONE]") {
      this.isDone = true;
      return [{ type: "done" }];
    }
    const parsed = safeJson(payload);
    if (!parsed)
      return [];
    return this.dialect === "openAI" ? this.consumeOpenAI(parsed) : this.consumeAnthropic(parsed);
  }
  consumeOpenAI(value) {
    const deltas = [];
    const root = value;
    const choices = Array.isArray(root.choices) ? root.choices : [];
    for (const choice of choices) {
      const choiceObject = choice;
      if (typeof choiceObject.finish_reason === "string")
        this.finishReason = choiceObject.finish_reason;
      const delta = choiceObject.delta ?? {};
      if (typeof delta.reasoning === "string") {
        this.reasoning += delta.reasoning;
        deltas.push({ type: "reasoning", text: delta.reasoning });
      }
      if (typeof delta.content === "string") {
        this.text += delta.content;
        deltas.push({ type: "content", text: delta.content });
      }
    }
    const usage = OpenAIUsageSchema.safeParse(root.usage);
    if (usage.success) {
      this.usage = compactUsage({
        promptTokens: usage.data.prompt_tokens,
        completionTokens: usage.data.completion_tokens,
        reasoningTokens: usage.data.completion_tokens_details?.reasoning_tokens
      });
      deltas.push({ type: "usage", usage: this.usage });
    }
    return deltas;
  }
  consumeAnthropic(value) {
    const deltas = [];
    const root = value;
    if (root.type === "message_start") {
      const usage = root.message?.usage ?? {};
      if (typeof usage.input_tokens === "number") {
        this.usage = { ...this.usage, promptTokens: usage.input_tokens };
        deltas.push({ type: "usage", usage: this.usage });
      }
    }
    if (root.type === "content_block_delta") {
      const delta = root.delta ?? {};
      if (delta.type === "thinking_delta" && typeof delta.thinking === "string") {
        this.reasoning += delta.thinking;
        deltas.push({ type: "reasoning", text: delta.thinking });
      }
      if (delta.type === "text_delta" && typeof delta.text === "string") {
        this.text += delta.text;
        deltas.push({ type: "content", text: delta.text });
      }
    }
    if (root.type === "message_delta") {
      const delta = root.delta ?? {};
      if (typeof delta.stop_reason === "string")
        this.finishReason = delta.stop_reason;
      const usage = root.usage ?? {};
      if (typeof usage.output_tokens === "number") {
        this.usage = { ...this.usage, completionTokens: usage.output_tokens };
        deltas.push({ type: "usage", usage: this.usage });
      }
    }
    if (root.type === "message_stop") {
      this.isDone = true;
      deltas.push({ type: "done" });
    }
    return deltas;
  }
};
function compactUsage(usage) {
  return Object.fromEntries(Object.entries(usage).filter(([, value]) => value !== void 0));
}
function safeJson(payload) {
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

// ../core/dist/providers/transportPolicy.js
var AITransportError = class extends Error {
  kind;
  statusCode;
  constructor(kind, message, statusCode) {
    super(message);
    this.name = "AITransportError";
    this.kind = kind;
    this.statusCode = statusCode;
  }
};
var retryAfterCapSeconds = 120;
function retryAfterSeconds(headers) {
  const value = headers.get("retry-after");
  if (!value)
    return void 0;
  const trimmed = value.trim();
  const seconds = Number(trimmed);
  if (/^[+-]?\d+(?:\.\d+)?$/.test(trimmed))
    return Number.isFinite(seconds) && seconds >= 0 ? seconds : void 0;
  const date = Date.parse(value);
  if (Number.isFinite(date))
    return Math.max(0, (date - Date.now()) / 1e3);
  return void 0;
}
function delayForAttempt(attempt, retryAfter, jitter = Math.random) {
  const backoff = Math.min(30, Math.pow(2, attempt));
  const honored = Math.max(backoff, retryAfter ?? 0);
  const jitterSeconds = Math.max(0, Math.min(0.5, jitter() * 0.5));
  return Math.min(retryAfterCapSeconds, honored + jitterSeconds);
}
async function sendWithRetry(request, init = {}, options = {}) {
  const maxAttempts = options.maxAttempts ?? 4;
  const sleep = options.sleep ?? defaultSleep;
  const jitter = options.jitter ?? Math.random;
  const fetchImpl = options.fetchImpl ?? fetch;
  let lastNetworkError;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetchImpl(request, init);
      if (response.ok)
        return response;
      if (response.status === 401 || response.status === 403) {
        throw new AITransportError("authFailed", `Authentication failed with HTTP ${response.status}`, response.status);
      }
      if (response.status === 400 || response.status === 422) {
        throw new AITransportError("badRequest", "Bad request", response.status);
      }
      if (!isRetryableStatus(response.status) || attempt === maxAttempts - 1) {
        throw response.status === 429 ? new AITransportError("rateLimited", "Rate limit retries exhausted", response.status) : new AITransportError("serverError", `HTTP ${response.status}`, response.status);
      }
      await sleep(delayForAttempt(attempt, retryAfterSeconds(response.headers), jitter));
    } catch (error) {
      if (error instanceof AITransportError)
        throw error;
      lastNetworkError = error;
      if (attempt === maxAttempts - 1) {
        throw new AITransportError("network", `Network retries exhausted: ${String(error)}`);
      }
      await sleep(delayForAttempt(attempt, void 0, jitter));
    }
  }
  throw new AITransportError("network", `Network retries exhausted: ${String(lastNetworkError)}`);
}
function isRetryableStatus(status) {
  return status === 429 || status >= 500 && status <= 599;
}
function defaultSleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1e3));
}

// ../core/dist/providers/responseParser.js
var AIResponseParseError = class extends Error {
  snippet;
  constructor(message, snippet) {
    super(message);
    this.name = "AIResponseParseError";
    this.snippet = trimForDisplay(snippet);
  }
};
function extractJSONObject(text) {
  let candidate = text.trim();
  if (candidate.startsWith("```")) {
    const lines = candidate.split(/\r?\n/);
    if (lines[0]?.trim().startsWith("```"))
      lines.shift();
    if (lines.at(-1)?.trim() === "```")
      lines.pop();
    candidate = lines.join("\n").trim();
  }
  if (candidate.startsWith("{") && candidate.endsWith("}"))
    return candidate;
  const balanced = firstBalancedJSONObject(candidate);
  if (balanced)
    return balanced;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start >= 0 && end >= start)
    return candidate.slice(start, end + 1);
  throw new AIResponseParseError("No JSON object found in model response", text);
}
function parseJSONFromResponse(text) {
  const json = extractJSONObject(text);
  try {
    return JSON.parse(json);
  } catch (error) {
    throw new AIResponseParseError(`Invalid JSON: ${String(error)}`, json);
  }
}
function firstBalancedJSONObject(text) {
  const start = text.indexOf("{");
  if (start < 0)
    return void 0;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0)
        return text.slice(start, index + 1);
    }
  }
  return void 0;
}
function trimForDisplay(text, limit = 900) {
  const compact = text.trim();
  return compact.length <= limit ? compact : `${compact.slice(0, limit)}...`;
}

// ../core/dist/providers/aiProvider.js
async function complete(systemPrompt, userPrompt, config, options = {}) {
  if (config.kind === "anthropic") {
    return completeAnthropic(systemPrompt, userPrompt, config, options);
  }
  return completeOpenAICompatible(systemPrompt, userPrompt, config, options);
}
async function completeJSON(systemPrompt, userPrompt, config, options = {}) {
  const completion = await complete(systemPrompt, userPrompt, config, options);
  return parseJSONFromResponse(completion.text);
}
function endpoint(config) {
  switch (config.kind) {
    case "openai":
      return "https://api.openai.com/v1/chat/completions";
    case "openrouter":
      return "https://openrouter.ai/api/v1/chat/completions";
    case "customOpenAICompatible":
      if (!config.baseURL)
        throw new Error("customOpenAICompatible requires baseURL");
      return config.baseURL;
    case "anthropic":
      return "https://api.anthropic.com/v1/messages";
  }
}
function shouldOmitTemperature(model) {
  const normalized = model.toLowerCase();
  return ["o1", "o3", "o4", "gpt-5", "gpt5", "reasoner", "reasoning", "qwq", "deepseek-r"].some((marker) => normalized.includes(marker));
}
function maxOutputTokensFor(model) {
  const normalized = model.toLowerCase();
  if (!normalized.includes("claude"))
    return 8192;
  if (["claude-3-5", "claude-3.5", "claude-3-haiku", "claude-3-opus", "claude-3-sonnet", "claude-2", "claude-instant"].some((marker) => normalized.includes(marker))) {
    return 8192;
  }
  return 32e3;
}
async function completeOpenAICompatible(systemPrompt, userPrompt, config, options) {
  const stream = Boolean(options.stream);
  const body = {
    model: config.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    stream
  };
  if (!shouldOmitTemperature(config.model))
    body.temperature = 0.25;
  if (config.supportsJSONResponseFormat !== false)
    body.response_format = { type: "json_object" };
  if (stream)
    body.stream_options = { include_usage: true };
  if (config.kind === "openrouter" && config.reasoningEffort && config.reasoningEffort !== "none") {
    body.reasoning = { effort: config.reasoningEffort, exclude: false };
  }
  const response = await sendWithRetry(endpoint(config), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      ...config.kind === "openrouter" ? { "HTTP-Referer": "https://localhost/nullius", "X-Title": "Nullius" } : {}
    },
    body: JSON.stringify(body)
  }, retryOptions(options.fetchImpl));
  if (stream)
    return readSSE(response, "openAI", options.stream);
  const payload = await response.json();
  const choice = payload.choices?.[0];
  assertNotTruncated(choice?.finish_reason);
  return {
    text: choice?.message?.content ?? "",
    reasoning: choice?.message?.reasoning ?? "",
    finishReason: choice?.finish_reason,
    usage: openAIUsage(payload.usage)
  };
}
async function completeAnthropic(systemPrompt, userPrompt, config, options) {
  const stream = Boolean(options.stream);
  const response = await sendWithRetry(endpoint(config), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: config.model,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: maxOutputTokensFor(config.model),
      stream
    })
  }, retryOptions(options.fetchImpl));
  if (stream)
    return readSSE(response, "anthropic", options.stream);
  const payload = await response.json();
  assertNotTruncated(payload.stop_reason);
  return {
    text: payload.content?.map((part) => part.type === "text" ? part.text : "").join("") ?? "",
    reasoning: payload.content?.map((part) => part.type === "thinking" ? part.thinking : "").join("") ?? "",
    finishReason: payload.stop_reason,
    usage: {
      promptTokens: payload.usage?.input_tokens,
      completionTokens: payload.usage?.output_tokens
    }
  };
}
async function readSSE(response, dialect, stream) {
  const parser = new StreamParser(dialect);
  const reader = response.body?.getReader();
  if (!reader)
    return { text: "", reasoning: "" };
  const decoder = new TextDecoder();
  let buffer = "";
  for (; ; ) {
    const chunk = await reader.read();
    if (chunk.done)
      break;
    buffer += decoder.decode(chunk.value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      for (const delta of parser.consumeLine(line))
        stream?.(delta);
    }
  }
  if (buffer.length > 0) {
    for (const delta of parser.consumeLine(buffer))
      stream?.(delta);
  }
  assertNotTruncated(parser.finishReason);
  return {
    text: parser.text,
    reasoning: parser.reasoning,
    usage: parser.usage,
    finishReason: parser.finishReason
  };
}
function openAIUsage(usage) {
  if (!usage)
    return void 0;
  return {
    promptTokens: usage.prompt_tokens,
    completionTokens: usage.completion_tokens,
    reasoningTokens: usage.completion_tokens_details?.reasoning_tokens
  };
}
function retryOptions(fetchImpl) {
  return fetchImpl ? { fetchImpl } : {};
}

// ../core/dist/exec/reproducibility.js
var numberPattern = /[-+]?(?:\d+\.\d+|\d+(?:\.\d+)?[eE][-+]?\d+|\d+)/g;
function canonicallyEqualText(left, right) {
  const normalizedLeft = canonicalizeText(left);
  const normalizedRight = canonicalizeText(right);
  return normalizedLeft === normalizedRight;
}
function canonicalizeText(value) {
  return value.replace(/\r\n/g, "\n").replace(numberPattern, (token) => normalizeNumericToken(token)).trim();
}
function normalizeNumericToken(token) {
  const value = Number(token);
  if (!Number.isFinite(value))
    return token;
  return Number.parseFloat(value.toPrecision(10)).toString();
}

// ../core/dist/exec/reproCheck.js
var import_node_fs3 = require("node:fs");
var import_promises3 = require("node:fs/promises");
var import_node_os = require("node:os");
var import_node_path3 = require("node:path");

// ../core/dist/exec/executionBackend.js
var import_node_crypto2 = require("node:crypto");
var import_node_child_process = require("node:child_process");
var import_node_worker_threads = require("node:worker_threads");
var import_node_fs = require("node:fs");
var import_promises = require("node:fs/promises");
var import_node_path = require("node:path");
var import_node_url = require("node:url");
var PyodideBackend = class {
  kind = "pyodide";
  async run(code, nodeDir, options = {}) {
    if (options.allowNetwork) {
      return rejected(this.kind, "network is not available in the default Pyodide sandbox");
    }
    if (options.signal?.aborted) {
      return cancelled(this.kind, "execution aborted before start");
    }
    return runPyodideWorker(code, nodeDir, options);
  }
};
var SandboxExecBackend = class {
  kind = "sandboxExec";
  pythonPath;
  constructor(pythonPath = process.env.NULLIUS_PYTHON ?? "python3") {
    this.pythonPath = pythonPath;
  }
  async run(code, nodeDir, options = {}) {
    if (process.platform !== "darwin") {
      return rejected(this.kind, "sandbox-exec backend is only available on macOS.");
    }
    if (options.allowNetwork) {
      return rejected(this.kind, "SandboxExecBackend is configured with network deny; allowNetwork is not supported.");
    }
    if (!await commandExists("sandbox-exec"))
      return rejected(this.kind, "sandbox-exec is not available.");
    await (0, import_promises.mkdir)((0, import_node_path.join)(nodeDir, "scripts"), { recursive: true });
    const scriptPath = (0, import_node_path.join)(nodeDir, "scripts", "generated.py");
    await (0, import_promises.writeFile)(scriptPath, code, "utf8");
    const runtimeRoots = this.pythonPath.startsWith("/Users/") ? [(0, import_node_path.dirname)((0, import_node_path.dirname)(this.pythonPath))] : [];
    const profile = sandboxProfile(nodeDir, runtimeRoots);
    const cpuCap = Math.max(10, Math.min(600, (options.timeoutSec ?? 60) * 2));
    const shellCommand = [
      `ulimit -t ${cpuCap} 2>/dev/null`,
      "ulimit -f 8388608 2>/dev/null",
      "ulimit -n 512 2>/dev/null",
      "ulimit -u 256 2>/dev/null",
      'exec sandbox-exec -p "$0" "$1" "$2"'
    ].join("; ");
    const result = await runHostProcess("/bin/sh", ["-c", shellCommand, profile, this.pythonPath, scriptPath], nodeDir, (options.timeoutSec ?? 60) * 1e3, options.signal);
    await persistLogs(nodeDir, result.stdout, result.stderr);
    const generatedFiles = result.exitCode === 0 ? await collectHostGeneratedFiles(nodeDir, options) : [];
    return {
      backend: this.kind,
      exitCode: result.exitCode,
      status: result.timedOut ? "timedOut" : result.exitCode === 0 ? "succeeded" : "failed",
      stdout: result.stdout,
      stderr: result.stderr,
      generatedFiles,
      ...result.error ? { error: result.error } : {}
    };
  }
};
var DockerBackend = class {
  kind = "docker";
  image;
  constructor(image = "python:3.12-slim") {
    this.image = image;
  }
  async run(code, nodeDir, options = {}) {
    if (!await commandExists("docker"))
      return rejected(this.kind, "docker is not available.");
    await (0, import_promises.mkdir)((0, import_node_path.join)(nodeDir, "scripts"), { recursive: true });
    const scriptPath = (0, import_node_path.join)(nodeDir, "scripts", "generated.py");
    await (0, import_promises.writeFile)(scriptPath, code, "utf8");
    const args = [
      "run",
      "--rm",
      options.allowNetwork ? "" : "--network=none",
      "--read-only",
      "--tmpfs",
      "/tmp:rw,noexec,nosuid,size=64m",
      "-v",
      `${nodeDir}:/work:rw`,
      "-w",
      "/work",
      "--cpus",
      "1",
      "--memory",
      "512m",
      this.image,
      "python",
      "scripts/generated.py"
    ].filter(Boolean);
    const result = await runHostProcess("docker", args, nodeDir, (options.timeoutSec ?? 60) * 1e3, options.signal);
    await persistLogs(nodeDir, result.stdout, result.stderr);
    const generatedFiles = result.exitCode === 0 ? await collectHostGeneratedFiles(nodeDir, options) : [];
    return {
      backend: this.kind,
      exitCode: result.exitCode,
      status: result.timedOut ? "timedOut" : result.exitCode === 0 ? "succeeded" : "failed",
      stdout: result.stdout,
      stderr: result.stderr,
      generatedFiles,
      ...result.error ? { error: result.error } : {}
    };
  }
};
function defaultExecutionBackend() {
  return new PyodideBackend();
}
function executionBackendFor(kind) {
  switch (kind) {
    case "auto":
    case "pyodide":
      return new PyodideBackend();
    case "sandboxExec":
      return new SandboxExecBackend();
    case "docker":
      return new DockerBackend();
  }
}
function resolvePyodideWorkerUrl() {
  const builtUrl = new URL("./pyodideWorker.js", __nullius_import_meta_url);
  if ((0, import_node_fs.existsSync)((0, import_node_url.fileURLToPath)(builtUrl)))
    return builtUrl;
  return new URL("./pyodideWorker.ts", __nullius_import_meta_url);
}
function runPyodideWorker(code, nodeDir, options) {
  return new Promise((resolve) => {
    const timeoutMs = (options.timeoutSec ?? 30) * 1e3;
    const worker = new import_node_worker_threads.Worker(resolvePyodideWorkerUrl(), {
      execArgv: [],
      workerData: {
        code,
        nodeDir,
        options: {
          timeoutSec: options.timeoutSec,
          limits: options.limits
        }
      }
    });
    let settled = false;
    const finish = async (result) => {
      if (settled)
        return;
      settled = true;
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", onAbort);
      await worker.terminate().catch(() => void 0);
      resolve(result);
    };
    const onAbort = () => {
      void finish(cancelled("pyodide", "execution aborted"));
    };
    const timer = setTimeout(() => {
      void finish({
        backend: "pyodide",
        exitCode: 124,
        status: "timedOut",
        stdout: "",
        stderr: "execution timed out",
        generatedFiles: [],
        error: "execution timed out"
      });
    }, timeoutMs);
    options.signal?.addEventListener("abort", onAbort, { once: true });
    worker.once("message", (message) => {
      void finish(message);
    });
    worker.once("error", (error) => {
      void finish({
        backend: "pyodide",
        exitCode: 1,
        status: "failed",
        stdout: "",
        stderr: String(error),
        generatedFiles: [],
        error: String(error)
      });
    });
    worker.once("exit", (codeValue) => {
      if (!settled && codeValue !== 0) {
        void finish({
          backend: "pyodide",
          exitCode: codeValue,
          status: "failed",
          stdout: "",
          stderr: `pyodide worker exited with code ${codeValue}`,
          generatedFiles: [],
          error: `pyodide worker exited with code ${codeValue}`
        });
      }
    });
  });
}
async function collectHostGeneratedFiles(nodeDir, options) {
  const maxFiles = options.limits?.maxGeneratedFiles ?? 200;
  const maxBytes = options.limits?.maxGeneratedBytes ?? 5e6;
  const files = [];
  const ignored = /* @__PURE__ */ new Set(["logs/stdout.log", "logs/stderr.log", "logs/git.diff", "scripts/generated.py"]);
  async function walk(directory, prefix = "") {
    if (files.length >= maxFiles)
      return;
    for (const entry of await (0, import_promises.readdir)(directory, { withFileTypes: true })) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (ignored.has(relative))
        continue;
      const absolute = (0, import_node_path.join)(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(absolute, relative);
        continue;
      }
      if (!entry.isFile())
        continue;
      const info = await (0, import_promises.stat)(absolute);
      if (info.size > maxBytes)
        continue;
      const data = await (0, import_promises.readFile)(absolute);
      const text = decodeTextIfLikely(data);
      files.push({
        path: relative,
        sha256: (0, import_node_crypto2.createHash)("sha256").update(data).digest("hex"),
        bytes: data.byteLength,
        ...text === void 0 ? {} : { text }
      });
    }
  }
  await walk(nodeDir);
  return files;
}
async function persistLogs(nodeDir, stdout, stderr) {
  const logDir = (0, import_node_path.join)(nodeDir, "logs");
  await (0, import_promises.mkdir)(logDir, { recursive: true });
  await (0, import_promises.writeFile)((0, import_node_path.join)(logDir, "stdout.log"), stdout, "utf8");
  await (0, import_promises.writeFile)((0, import_node_path.join)(logDir, "stderr.log"), stderr, "utf8");
}
function decodeTextIfLikely(data) {
  if (data.length > 2e5)
    return void 0;
  if (data.some((byte) => byte === 0))
    return void 0;
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(data);
  } catch {
    return void 0;
  }
}
async function commandExists(command) {
  const candidates = process.env.PATH?.split(":").map((dir) => (0, import_node_path.join)(dir, command)) ?? [];
  for (const candidate of candidates) {
    try {
      await (0, import_promises.access)(candidate);
      return true;
    } catch {
    }
  }
  return false;
}
function cancelled(kind, reason) {
  return {
    backend: kind,
    exitCode: 130,
    status: "timedOut",
    stdout: "",
    stderr: reason,
    generatedFiles: [],
    error: reason
  };
}
function rejected(kind, reason) {
  return {
    backend: kind,
    exitCode: 1,
    status: "rejected",
    stdout: "",
    stderr: reason,
    generatedFiles: [],
    error: reason
  };
}
function sandboxProfile(nodeDir, runtimeRoots = []) {
  const escape = (path) => path.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const withPrivate = (path) => /^\/(?:tmp|var|etc)(?:\/|$)/.test(path) ? [path, `/private${path}`] : [path];
  const nodePaths = withPrivate(nodeDir).map((path) => `(subpath "${escape(path)}")`).join(" ");
  const runtimePaths = runtimeRoots.flatMap(withPrivate).map((path) => `(subpath "${escape(path)}")`).join(" ");
  return [
    "(version 1)",
    "(deny default)",
    "(allow process*)",
    "(allow sysctl-read)",
    "(allow mach-lookup)",
    "(allow file-read-metadata)",
    // Deny-list model, matching the reference design: system reads are allowed
    // (the interpreter needs dyld caches, locales, /dev), the user's home is
    // denied wholesale, and only the node folder (plus an explicitly named
    // runtime root, e.g. a pyenv install) is re-allowed beneath it.
    "(allow file-read*)",
    '(deny file-read* (subpath "/Users"))',
    `(allow file-read* ${nodePaths}${runtimePaths ? " " + runtimePaths : ""})`,
    `(allow file-write* ${nodePaths} (literal "/dev/null") (literal "/dev/tty"))`,
    "(deny network*)"
  ].join("\n");
}
function runHostProcess(cmd, args, cwd, timeoutMs, signal) {
  return new Promise((resolve) => {
    const child = (0, import_node_child_process.spawn)(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    const stdout = [];
    const stderr = [];
    let settled = false;
    const finish = (value) => {
      if (settled)
        return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      resolve(value);
    };
    const onAbort = () => {
      child.kill("SIGKILL");
      finish({ exitCode: 130, stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8"), timedOut: false, error: "execution aborted" });
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    if (signal?.aborted)
      onAbort();
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      finish({ exitCode: 124, stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8"), timedOut: true, error: "execution timed out" });
    }, timeoutMs);
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", (error) => {
      finish({ exitCode: 127, stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8"), timedOut: false, error: String(error) });
    });
    child.on("close", (code) => {
      finish({ exitCode: code ?? 1, stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8"), timedOut: false });
    });
  });
}

// ../core/dist/store/projectStore.js
var import_promises2 = require("node:fs/promises");
var import_node_fs2 = require("node:fs");
var import_node_path2 = require("node:path");
async function createProject(root, manifest) {
  await (0, import_promises2.mkdir)((0, import_node_path2.join)(root, "plans"), { recursive: true });
  await (0, import_promises2.mkdir)((0, import_node_path2.join)(root, "lanes"), { recursive: true });
  await (0, import_promises2.mkdir)((0, import_node_path2.join)(root, "manuscript", "patches"), { recursive: true });
  await (0, import_promises2.mkdir)((0, import_node_path2.join)(root, "runtime", "transcripts"), { recursive: true });
  await atomicWriteJSON((0, import_node_path2.join)(root, "nullius.json"), ProjectManifestSchema.parse(manifest));
  await atomicWriteJSON((0, import_node_path2.join)(root, "evidence.json"), []);
  await atomicWriteJSON((0, import_node_path2.join)(root, "claims.json"), []);
  await atomicWriteJSON((0, import_node_path2.join)(root, "literature.json"), []);
  await atomicWriteJSON((0, import_node_path2.join)(root, "methods.json"), []);
  await atomicWriteJSON((0, import_node_path2.join)(root, "source-activities.json"), []);
  await atomicWriteJSON((0, import_node_path2.join)(root, "runtime", "agent-runs.json"), []);
  await atomicWriteText((0, import_node_path2.join)(root, "manuscript", "report.md"), "");
}
async function loadProject(root) {
  const manifest = ProjectManifestSchema.parse(await readJSON((0, import_node_path2.join)(root, "nullius.json")));
  const plans = await loadPlans((0, import_node_path2.join)(root, "plans"));
  const lanes = await loadLanes((0, import_node_path2.join)(root, "lanes"));
  const evidence = external_exports.array(EvidenceItemSchema).parse(await readJSONIfExists((0, import_node_path2.join)(root, "evidence.json"), []));
  const claims = external_exports.array(ClaimSchema).parse(await readJSONIfExists((0, import_node_path2.join)(root, "claims.json"), []));
  const literature = external_exports.array(LiteratureItemSchema).parse(await readJSONIfExists((0, import_node_path2.join)(root, "literature.json"), []));
  const methods = external_exports.array(MethodItemSchema).parse(await readJSONIfExists((0, import_node_path2.join)(root, "methods.json"), []));
  const sourceActivities = external_exports.array(SourceActivitySchema).parse(await readJSONIfExists((0, import_node_path2.join)(root, "source-activities.json"), []));
  const agentRunResults = external_exports.array(AgentRunResultSchema).parse(await readJSONIfExists((0, import_node_path2.join)(root, "runtime", "agent-runs.json"), []));
  const manuscriptBody = await readTextIfExists((0, import_node_path2.join)(root, "manuscript", "report.md"), "");
  const patches = await loadPatches((0, import_node_path2.join)(root, "manuscript", "patches"));
  return { root, manifest, plans, lanes, manuscriptBody, evidence, claims, literature, methods, patches, sourceActivities, agentRunResults };
}
function snapshotToGateProject(snapshot) {
  return {
    manuscriptBody: snapshot.manuscriptBody,
    evidence: snapshot.evidence,
    claims: snapshot.claims,
    literature: snapshot.literature,
    methods: snapshot.methods,
    patches: snapshot.patches,
    protocolLock: snapshot.manifest.protocolLock,
    amendments: snapshot.manifest.amendments,
    nodes: snapshot.lanes.flatMap((lane) => lane.nodes.map((node) => ({
      id: node.id,
      status: node.status,
      reviewSeverity: node.review?.severity,
      reproducibilityStatus: node.reproducibility
    })))
  };
}
function evidenceArtifactPath(root, evidence) {
  if (!evidence.path)
    return void 0;
  if ((0, import_node_path2.isAbsolute)(evidence.path))
    return evidence.path;
  if (evidence.laneId && evidence.nodeId)
    return (0, import_node_path2.join)(root, "lanes", evidence.laneId, "nodes", evidence.nodeId, evidence.path);
  return (0, import_node_path2.join)(root, evidence.path);
}
var maxGroundingArtifactBytes = 2 * 1024 * 1024;
function loadArtifactTexts(root, evidence) {
  const texts = [];
  for (const item of evidence) {
    let loaded;
    if (item.path && item.laneId && item.nodeId) {
      const absolute = (0, import_node_path2.join)(root, "lanes", item.laneId, "nodes", item.nodeId, item.path);
      try {
        const stats = (0, import_node_fs2.statSync)(absolute);
        if (stats.isFile() && stats.size <= maxGroundingArtifactBytes) {
          loaded = (0, import_node_fs2.readFileSync)(absolute, "utf8");
        }
      } catch {
        loaded = void 0;
      }
    }
    const text = loaded ?? item.summary;
    if (text)
      texts.push(text);
  }
  return texts;
}
function projectGateIO(root) {
  return {
    artifactExists: (evidence) => {
      const path = evidenceArtifactPath(root, evidence);
      return path ? (0, import_node_fs2.existsSync)(path) : true;
    },
    artifactText: (evidence) => {
      const path = evidenceArtifactPath(root, evidence);
      if (!path || !(0, import_node_fs2.existsSync)(path))
        return evidence.summary;
      try {
        return (0, import_node_fs2.readFileSync)(path, "utf8");
      } catch {
        return evidence.summary;
      }
    }
  };
}
async function saveManifest(root, manifest) {
  await atomicWriteJSON((0, import_node_path2.join)(root, "nullius.json"), ProjectManifestSchema.parse(manifest));
}
async function savePlan(root, plan) {
  await atomicWriteJSON((0, import_node_path2.join)(root, "plans", `${plan.id}.json`), PlanSchema.parse(plan));
}
async function saveLane(root, lane) {
  await atomicWriteJSON((0, import_node_path2.join)(root, "lanes", lane.id, "lane.json"), LaneSchema.parse(lane));
}
async function saveNode(root, laneId, node, narrative) {
  const nodeDir = (0, import_node_path2.join)(root, "lanes", laneId, "nodes", node.id);
  await atomicWriteJSON((0, import_node_path2.join)(nodeDir, "node.json"), NodeRecordSchema.parse(node));
  await atomicWriteText((0, import_node_path2.join)(nodeDir, "node.md"), narrative);
}
async function saveEvidence(root, evidence) {
  await atomicWriteJSON((0, import_node_path2.join)(root, "evidence.json"), external_exports.array(EvidenceItemSchema).parse(evidence));
}
async function saveClaims(root, claims) {
  await atomicWriteJSON((0, import_node_path2.join)(root, "claims.json"), external_exports.array(ClaimSchema).parse(claims));
}
async function saveLiterature(root, literature) {
  await atomicWriteJSON((0, import_node_path2.join)(root, "literature.json"), external_exports.array(LiteratureItemSchema).parse(literature));
}
async function saveSourceActivities(root, activities) {
  await atomicWriteJSON((0, import_node_path2.join)(root, "source-activities.json"), external_exports.array(SourceActivitySchema).parse(activities));
}
async function saveAgentRunResults(root, results) {
  await atomicWriteJSON((0, import_node_path2.join)(root, "runtime", "agent-runs.json"), external_exports.array(AgentRunResultSchema).parse(results));
}
async function saveManuscript(root, body) {
  await atomicWriteText((0, import_node_path2.join)(root, "manuscript", "report.md"), body);
}
async function savePatch(root, patch) {
  await atomicWriteJSON((0, import_node_path2.join)(root, "manuscript", "patches", `${patch.id}.json`), PatchSchema.parse(patch));
}
async function atomicWriteJSON(path, value) {
  await atomicWriteText(path, `${JSON.stringify(value, null, 2)}
`);
}
async function atomicWriteText(path, value) {
  await (0, import_promises2.mkdir)((0, import_node_path2.dirname)(path), { recursive: true });
  const tempPath = `${path}.tmp-${process.pid}-${Date.now()}`;
  await (0, import_promises2.writeFile)(tempPath, value, "utf8");
  await (0, import_promises2.rename)(tempPath, path);
}
async function readJSON(path) {
  return JSON.parse(await (0, import_promises2.readFile)(path, "utf8"));
}
async function readJSONIfExists(path, fallback) {
  if (!(0, import_node_fs2.existsSync)(path))
    return fallback;
  return readJSON(path);
}
async function readTextIfExists(path, fallback) {
  if (!(0, import_node_fs2.existsSync)(path))
    return fallback;
  return (0, import_promises2.readFile)(path, "utf8");
}
async function loadPatches(directory) {
  if (!(0, import_node_fs2.existsSync)(directory))
    return [];
  const entries = await (0, import_promises2.readdir)(directory);
  const patches = [];
  for (const entry of entries.filter((item) => item.endsWith(".json")).sort()) {
    patches.push(PatchSchema.parse(await readJSON((0, import_node_path2.join)(directory, entry))));
  }
  return patches;
}
async function loadPlans(directory) {
  if (!(0, import_node_fs2.existsSync)(directory))
    return [];
  const entries = await (0, import_promises2.readdir)(directory);
  const plans = [];
  for (const entry of entries.filter((item) => item.endsWith(".json")).sort()) {
    plans.push(PlanSchema.parse(await readJSON((0, import_node_path2.join)(directory, entry))));
  }
  return plans;
}
async function loadLanes(directory) {
  if (!(0, import_node_fs2.existsSync)(directory))
    return [];
  const entries = await (0, import_promises2.readdir)(directory, { withFileTypes: true });
  const lanes = [];
  for (const entry of entries.filter((item) => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const laneDir = (0, import_node_path2.join)(directory, entry.name);
    const lane = LaneSchema.parse(await readJSON((0, import_node_path2.join)(laneDir, "lane.json")));
    const nodes = await loadNodes((0, import_node_path2.join)(laneDir, "nodes"));
    lanes.push({ ...lane, nodes });
  }
  return lanes;
}
async function loadNodes(directory) {
  if (!(0, import_node_fs2.existsSync)(directory))
    return [];
  const entries = await (0, import_promises2.readdir)(directory, { withFileTypes: true });
  const nodes = [];
  for (const entry of entries.filter((item) => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    nodes.push(NodeRecordSchema.parse(await readJSON((0, import_node_path2.join)(directory, entry.name, "node.json"))));
  }
  return nodes;
}

// ../core/dist/exec/reproCheck.js
async function checkProjectReproducibility(root, backend = defaultExecutionBackend()) {
  const snapshot = await loadProject(root);
  const nodes = [];
  for (const lane of snapshot.lanes) {
    for (const node of lane.nodes) {
      if (!node.generatedCode.trim()) {
        nodes.push({ nodeId: node.id, status: "notChecked", reason: "node has no generated code" });
        continue;
      }
      const evidence = snapshot.evidence.filter((item) => item.nodeId === node.id && item.type === "execution" && item.path);
      if (evidence.length === 0) {
        nodes.push({ nodeId: node.id, status: "notChecked", reason: "node has no execution evidence" });
        continue;
      }
      const stage = await (0, import_promises3.mkdtemp)((0, import_node_path3.join)((0, import_node_os.tmpdir)(), "nullius-repro-"));
      try {
        const originalNodeDir = (0, import_node_path3.join)(root, "lanes", lane.id, "nodes", node.id);
        await (0, import_promises3.cp)(originalNodeDir, stage, { recursive: true, force: true });
        const remainingRecordedArtifacts = await removeRecordedArtifacts(stage, evidence.map((item) => item.path).filter((path) => Boolean(path)));
        if (remainingRecordedArtifacts.length > 0) {
          await saveNode(root, lane.id, { ...node, reproducibility: "failed" }, nodeNarrative(node.title, node.generatedCode, "Reproducibility staging failed."));
          nodes.push({ nodeId: node.id, status: "failed", reason: `recorded artifacts could not be removed from staging: ${remainingRecordedArtifacts.join(", ")}` });
          continue;
        }
        const result = await backend.run(node.generatedCode, stage, { allowNetwork: false, timeoutSec: 30 });
        if (result.status !== "succeeded") {
          await saveNode(root, lane.id, { ...node, reproducibility: "failed" }, nodeNarrative(node.title, node.generatedCode, "Reproducibility run failed."));
          nodes.push({ nodeId: node.id, status: "failed", reason: result.stderr || result.error || "execution failed" });
          continue;
        }
        const generatedByPath = new Map(result.generatedFiles.map((file) => [file.path, file]));
        const mismatches = evidence.filter((item) => {
          const generated = generatedByPath.get(item.path ?? "");
          if (!generated)
            return true;
          if (item.sha256 && item.sha256 === generated.sha256)
            return false;
          return !(item.summary && generated.text && canonicallyEqualText(item.summary, generated.text));
        });
        const status = mismatches.length === 0 ? "reproduced" : "divergent";
        await saveNode(root, lane.id, { ...node, reproducibility: status }, nodeNarrative(node.title, node.generatedCode, `Reproducibility: ${status}`));
        nodes.push({ nodeId: node.id, status, reason: mismatches.length === 0 ? "all artifacts matched" : `${mismatches.length} artifact(s) diverged or were not regenerated` });
      } finally {
        await (0, import_promises3.rm)(stage, { recursive: true, force: true });
      }
    }
  }
  return {
    total: nodes.length,
    reproduced: nodes.filter((node) => node.status === "reproduced").length,
    divergent: nodes.filter((node) => node.status === "divergent").length,
    failed: nodes.filter((node) => node.status === "failed").length,
    notChecked: nodes.filter((node) => node.status === "notChecked").length,
    nodes
  };
}
async function removeRecordedArtifacts(stage, paths) {
  const uniquePaths = /* @__PURE__ */ new Set([
    ...paths,
    "logs/stdout.log",
    "logs/stderr.log",
    "logs/git.diff"
  ]);
  const remaining = [];
  for (const relative of uniquePaths) {
    if (relative.split("/").some((part) => part === ".." || part.length === 0))
      continue;
    const target = (0, import_node_path3.join)(stage, relative);
    await (0, import_promises3.rm)(target, { recursive: true, force: true }).catch(() => void 0);
    if ((0, import_node_fs3.existsSync)(target))
      remaining.push(relative);
    await (0, import_promises3.rm)((0, import_node_path3.dirname)(target), { recursive: false, force: true }).catch(() => void 0);
  }
  return remaining;
}
function nodeNarrative(title, code, detail) {
  return [`# ${title}`, "", "```python", code, "```", "", detail].join("\n");
}

// ../core/dist/store/patchActions.js
async function approvePatch(root, patchId) {
  const snapshot = await loadProject(root);
  const patch = snapshot.patches.find((item) => item.id === patchId);
  if (!patch)
    throw new Error(`Patch not found: ${patchId}`);
  const approved = PatchSchema.parse({ ...patch, status: "approved" });
  const result = applyPatchIfValid(snapshot.manuscriptBody, approved);
  if (!result.applied) {
    await savePatch(root, { ...approved, status: "needsRevision" });
    return {
      applied: false,
      patch: { ...approved, status: "needsRevision" },
      ...result.reason === void 0 ? {} : { reason: result.reason }
    };
  }
  const appliedPatch = PatchSchema.parse({ ...approved, appliedAt: (/* @__PURE__ */ new Date()).toISOString() });
  await saveManuscript(root, result.body);
  await savePatch(root, appliedPatch);
  return { applied: true, patch: appliedPatch };
}
async function rejectPatch(root, patchId) {
  const snapshot = await loadProject(root);
  const patch = snapshot.patches.find((item) => item.id === patchId);
  if (!patch)
    throw new Error(`Patch not found: ${patchId}`);
  const rejected2 = PatchSchema.parse({ ...patch, status: "rejected" });
  await savePatch(root, rejected2);
  return rejected2;
}
async function exportMarkdown(root) {
  return (await loadProject(root)).manuscriptBody;
}

// ../core/dist/transcript/runTranscript.js
var import_promises4 = require("node:fs/promises");
var import_node_fs4 = require("node:fs");
var import_node_path4 = require("node:path");
var TranscriptRecordSchema = external_exports.object({
  seq: external_exports.number().int().positive(),
  ts: external_exports.string(),
  runId: external_exports.string(),
  kind: external_exports.enum(["systemPrompt", "userPrompt", "delta", "reasoning", "response", "usage", "error", "event"]),
  role: external_exports.enum(["planner", "executor", "reviewer", "synthesizer", "system", "user"]).default("system"),
  text: external_exports.string()
});
var RunTranscriptStore = class {
  counters = /* @__PURE__ */ new Map();
  async append(root, runId, record) {
    const seq = (this.counters.get(runId) ?? await this.currentSeq(root, runId)) + 1;
    this.counters.set(runId, seq);
    const fullRecord = TranscriptRecordSchema.parse({
      ...record,
      seq,
      ts: (/* @__PURE__ */ new Date()).toISOString(),
      runId
    });
    const path = transcriptPath(root, runId);
    await (0, import_promises4.mkdir)((0, import_node_path4.dirname)(path), { recursive: true });
    await (0, import_promises4.writeFile)(path, `${JSON.stringify(fullRecord)}
`, { encoding: "utf8", flag: "a" });
    return fullRecord;
  }
  async load(root, runId) {
    const path = transcriptPath(root, runId);
    if (!(0, import_node_fs4.existsSync)(path))
      return [];
    return (await (0, import_promises4.readFile)(path, "utf8")).split(/\r?\n/).filter(Boolean).map((line) => TranscriptRecordSchema.parse(JSON.parse(line)));
  }
  async currentSeq(root, runId) {
    const records = await this.load(root, runId);
    return records.at(-1)?.seq ?? 0;
  }
};
function transcriptPath(root, runId) {
  return (0, import_node_path4.join)(root, "runtime", "transcripts", `${runId}.jsonl`);
}

// ../core/dist/orchestrator/fullAuto.js
var import_node_crypto3 = require("node:crypto");
var import_promises5 = require("node:fs/promises");
var import_node_path5 = require("node:path");
var FullAutoOrchestrator = class {
  backend;
  transcriptStore;
  constructor(options = {}) {
    this.backend = options.backend ?? defaultExecutionBackend();
    this.transcriptStore = options.transcriptStore ?? new RunTranscriptStore();
  }
  async runOnce(root, agents, onEvent, options = {}) {
    const releaseLock = await acquireProjectRunLock(root, (0, import_node_crypto3.randomUUID)());
    try {
      return await this.runOnceUnlocked(root, agents, onEvent, options);
    } finally {
      await releaseLock();
    }
  }
  async runOnceUnlocked(root, agents, onEvent, options = {}) {
    const runId = (0, import_node_crypto3.randomUUID)();
    const events = [];
    let seq = 0;
    const emit = async (event) => {
      const full = { ...event, seq: ++seq, ts: (/* @__PURE__ */ new Date()).toISOString() };
      events.push(full);
      onEvent?.(full);
      await this.transcriptStore.append(root, runId, { kind: "event", role: full.role, text: `${full.title}${full.detail ? `
${full.detail}` : ""}` });
    };
    const streamOptions = (role, purpose) => ({
      onCall: (record) => {
        void this.transcriptStore.append(root, runId, { kind: "systemPrompt", role, text: `[${purpose}]
${record.systemPrompt}` });
        void this.transcriptStore.append(root, runId, { kind: "userPrompt", role, text: record.userPrompt });
      },
      onResponse: (text) => {
        void this.transcriptStore.append(root, runId, { kind: "response", role, text });
      },
      onStream: (delta) => {
        const kind = delta.type;
        options.onStream?.({
          runId,
          role,
          purpose,
          kind,
          ...delta.type === "content" || delta.type === "reasoning" ? { text: delta.text } : {},
          ...delta.type === "usage" ? { usage: delta.usage } : {}
        });
        void this.transcriptStore.append(root, runId, {
          kind: delta.type === "reasoning" ? "reasoning" : delta.type === "usage" ? "usage" : "delta",
          role,
          text: delta.type === "usage" ? JSON.stringify(delta.usage) : delta.type === "done" ? "[done]" : delta.text
        });
      }
    });
    let snapshot = await loadProject(root);
    const steering = await consumeSteering(root);
    if (steering) {
      await emit({ kind: "steering.consumed", role: "system", title: "Steering instruction consumed", detail: steering });
    }
    const approvedPlans = snapshot.plans.filter((plan) => plan.approved);
    if (approvedPlans.length === 0) {
      const candidate = { ...await agents.createPlan(withSteering(snapshot.manifest.question, steering), streamOptions("planner", "planning")), approved: false };
      await savePlan(root, candidate);
      await emit({ kind: "plan.created", role: "planner", title: "Plan candidate created", detail: `${candidate.title}
Adopt a plan before Full Auto can execute it.` });
      await emit({ kind: "intervention.required", role: "system", title: "Plan adoption required", detail: "Nullius will not lock a protocol or execute research from an unapproved AI plan." });
      const current = await loadProject(root);
      return { runId, ready: readinessReport(snapshotToGateProject(current), current.manifest.settings.depth, projectGateIO(root)).ready, events };
    }
    let manifest = snapshot.manifest;
    if (!manifest.protocolLock) {
      manifest = ensureProtocolLockFromPlan(manifest, approvedPlans[0]);
      await saveManifest(root, manifest);
      await emit({ kind: "protocol.locked", role: "planner", title: "Protocol locked", detail: approvedPlans[0].title });
    }
    await ensureLanesForApprovedPlans(root, snapshot, approvedPlans, emit);
    snapshot = await loadProject(root);
    const maxLanes = Math.max(1, manifest.settings.maxLanes ?? 1);
    const maxNodes = manifest.settings.maxNodes ?? maxLanes;
    const existingNodeCount = snapshot.lanes.reduce((count, lane) => count + lane.nodes.length, 0);
    const remainingNodeBudget = Math.max(0, maxNodes - existingNodeCount);
    if (remainingNodeBudget === 0) {
      await emit({ kind: "run.completed", role: "system", title: "Node budget reached", detail: `maxNodes=${maxNodes}` });
      return { runId, ready: readinessReport(snapshotToGateProject(snapshot), manifest.settings.depth, projectGateIO(root)).ready, events };
    }
    const eligible = selectEligibleLanes(snapshot, approvedPlans, Math.min(maxLanes, remainingNodeBudget));
    if (eligible.length === 0) {
      await emit({ kind: "intervention.required", role: "system", title: "No eligible lane", detail: "All lanes are blocked, running, or waiting for user action." });
      return { runId, ready: readinessReport(snapshotToGateProject(snapshot), manifest.settings.depth, projectGateIO(root)).ready, events };
    }
    const produced = await Promise.all(eligible.map(({ lane, plan }) => this.produceNode(root, runId, lane, withPlanSteering(plan, steering), agents, emit, streamOptions, manifest.settings.selfCorrectionRounds, options.signal)));
    let lastPatch;
    for (const item of produced) {
      const patch = await this.applyProducedNode(root, item, emit, streamOptions);
      if (patch)
        lastPatch = patch;
    }
    const finalSnapshot = await loadProject(root);
    const ready = readinessReport(snapshotToGateProject(finalSnapshot), manifest.settings.depth, projectGateIO(root)).ready;
    await emit({ kind: "run.completed", role: "system", title: "Run completed", detail: ready ? "ready" : "not ready" });
    return lastPatch ? { runId, ready, patch: lastPatch, events } : { runId, ready, events };
  }
  async produceNode(root, runId, lane, plan, agents, emit, streamOptions, selfCorrectionRounds, signal) {
    const dataFiles = await listProjectDataFiles(root);
    let draft = await agents.createExecutorDraft(plan, { ...streamOptions("executor", "nodeExecution"), dataFiles });
    const node = {
      id: (0, import_node_crypto3.randomUUID)(),
      title: draft.title,
      status: "running",
      prerequisiteNodeIds: lane.nodes.at(-1)?.id ? [lane.nodes.at(-1).id] : [],
      generatedCode: draft.code,
      reproducibility: "notChecked"
    };
    const laneRecord = { id: lane.id, name: lane.name, planId: lane.planId, nodeOrder: [...lane.nodeOrder, node.id] };
    await saveLane(root, laneRecord);
    await saveNode(root, lane.id, node, nodeNarrative2(node, "Generated; execution pending."));
    await emit({ kind: "node.generated", role: "executor", title: "Node generated", detail: `${lane.name}: ${draft.title}` });
    const nodeDir = (0, import_node_path5.join)(root, "lanes", lane.id, "nodes", node.id);
    await stageProjectDataFiles(root, nodeDir, dataFiles);
    const executionOptions = signal ? { allowNetwork: false, timeoutSec: 30, signal } : { allowNetwork: false, timeoutSec: 30 };
    let execution;
    let review;
    let started = Date.now();
    const maxCorrectionRounds = Math.max(0, selfCorrectionRounds);
    for (let attempt = 0; attempt <= maxCorrectionRounds; attempt += 1) {
      started = Date.now();
      node.generatedCode = draft.code;
      node.status = "running";
      await saveNode(root, lane.id, node, nodeNarrative2(node, attempt === 0 ? "Executing." : `Executing corrected draft round ${attempt}.`));
      execution = await this.backend.run(draft.code, nodeDir, executionOptions);
      node.status = execution.status === "succeeded" ? "completed" : "error";
      node.executionRecord = {
        exitCode: execution.exitCode,
        startedAt: new Date(started).toISOString(),
        durationMs: Date.now() - started,
        backend: execution.backend
      };
      await saveNode(root, lane.id, node, nodeNarrative2(node, execution.stdout || execution.stderr));
      await emit({ kind: "node.executed", role: "executor", title: execution.status === "succeeded" ? "Node executed" : "Execution failed", detail: execution.stderr || execution.stdout });
      review = await agents.reviewNode({ draft, exitCode: execution.exitCode, stdout: execution.stdout, stderr: execution.stderr }, streamOptions("reviewer", "review"));
      node.review = review;
      await saveNode(root, lane.id, node, nodeNarrative2(node, review.summary));
      await emit({ kind: "review.completed", role: "reviewer", title: "Review completed", detail: review.summary });
      if (execution.status === "succeeded" && (review.severity === "clear" || review.severity === "info"))
        break;
      if (attempt >= maxCorrectionRounds || !agents.reviseExecutorDraft)
        break;
      await emit({
        kind: "selfCorrection.started",
        role: "executor",
        title: `Self-correction round ${attempt + 1}`,
        detail: [...review.concerns, execution.stderr].filter(Boolean).join("\n") || review.summary
      });
      draft = await agents.reviseExecutorDraft({ plan, draft, review, execution }, streamOptions("executor", "selfCorrection"));
      node.title = draft.title;
      node.generatedCode = draft.code;
      await saveNode(root, lane.id, node, nodeNarrative2(node, "Corrected draft generated; execution pending."));
      await emit({ kind: "selfCorrection.completed", role: "executor", title: "Corrected draft generated", detail: draft.title });
    }
    if (!execution || !review)
      throw new Error("Full Auto failed before node execution completed.");
    const nodeRelativeDir = (0, import_node_path5.join)("lanes", lane.id, "nodes", node.id);
    const gitDiffPath = (0, import_node_path5.join)(nodeRelativeDir, "logs", "git.diff");
    await atomicWriteText((0, import_node_path5.join)(root, gitDiffPath), "");
    const finishedAt = (/* @__PURE__ */ new Date()).toISOString();
    const agentRunResult = {
      id: `agent-run-${runId}-${node.id}`,
      runStatus: execution.status === "succeeded" ? "succeeded" : execution.status === "timedOut" ? "cancelled" : "failed",
      exitCode: execution.exitCode,
      schemaValidationStatus: "notApplicable",
      stdoutPath: (0, import_node_path5.join)(nodeRelativeDir, "logs", "stdout.log"),
      stderrPath: (0, import_node_path5.join)(nodeRelativeDir, "logs", "stderr.log"),
      createdFiles: execution.generatedFiles.map((file) => (0, import_node_path5.join)(nodeRelativeDir, file.path)),
      modifiedFiles: [],
      deletedFiles: [],
      sha256ByPath: Object.fromEntries(execution.generatedFiles.map((file) => [(0, import_node_path5.join)(nodeRelativeDir, file.path), file.sha256])),
      gitDiffPath,
      artifactManifestStatus: execution.generatedFiles.length > 0 ? "valid" : "missing",
      startedAt: new Date(started).toISOString(),
      finishedAt,
      ...execution.generatedFiles.length > 0 ? { artifactManifest: { files: execution.generatedFiles.map((file) => ({ path: file.path, sha256: file.sha256, bytes: file.bytes })) } } : {}
    };
    const sourceActivity = {
      id: `activity-${runId}-${node.id}`,
      type: "execution",
      title: draft.title,
      startedAt: new Date(started).toISOString(),
      finishedAt,
      actorType: "agent",
      actorId: "executor",
      relatedTaskId: node.id,
      agentRunResultId: agentRunResult.id
    };
    return { agents, lane, plan, node, draft, execution, review, sourceActivity, agentRunResult };
  }
  async applyProducedNode(root, item, emit, streamOptions) {
    const beforeAppend = await loadProject(root);
    await saveAgentRunResults(root, [...beforeAppend.agentRunResults, item.agentRunResult]);
    await saveSourceActivities(root, [...beforeAppend.sourceActivities, item.sourceActivity]);
    if (item.execution.status !== "succeeded" || item.review.severity === "critical") {
      await emit({ kind: "intervention.required", role: "system", title: "Execution needs attention", detail: item.execution.stderr || item.review.summary || "Execution or review did not clear." });
      return void 0;
    }
    const reviewStatus = item.review.severity === "clear" || item.review.severity === "info" ? "approved" : "needsRevision";
    const validation = reviewStatus === "approved" ? "valid" : "stale";
    const evidenceItems = item.execution.generatedFiles.map((file) => ({
      id: (0, import_node_crypto3.randomUUID)(),
      type: "execution",
      laneId: item.lane.id,
      nodeId: item.node.id,
      title: file.path,
      summary: file.text ?? "",
      path: file.path,
      sha256: file.sha256,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      sourceActivityId: item.sourceActivity.id,
      sourceActivityType: "execution",
      validation,
      review: reviewStatus,
      execution: {
        producingCommand: "pyodide python",
        exitCode: item.execution.exitCode,
        stdoutPath: (0, import_node_path5.join)("lanes", item.lane.id, "nodes", item.node.id, "logs", "stdout.log"),
        stderrPath: (0, import_node_path5.join)("lanes", item.lane.id, "nodes", item.node.id, "logs", "stderr.log"),
        artifactPaths: item.execution.generatedFiles.map((generated) => generated.path),
        sha256ByPath: Object.fromEntries(item.execution.generatedFiles.map((generated) => [generated.path, generated.sha256])),
        environmentSummary: `${item.execution.backend} sandbox`
      }
    }));
    const evidenceSnapshot = await loadProject(root);
    const evidence = [...evidenceSnapshot.evidence, ...evidenceItems];
    await saveEvidence(root, evidence);
    const primaryEvidence = evidenceItems.find((entry) => entry.review === "approved" && entry.execution?.exitCode === 0);
    const claim = {
      id: (0, import_node_crypto3.randomUUID)(),
      text: item.draft.claimText,
      type: "result",
      supportRefs: primaryEvidence ? [{ targetType: "evidence", targetId: primaryEvidence.id, role: "primary", validation: "valid" }] : [],
      validation: primaryEvidence ? "valid" : "stale",
      review: primaryEvidence ? "approved" : "needsRevision",
      qmdPatchIds: []
    };
    const claimSnapshot = await loadProject(root);
    const claims = [...claimSnapshot.claims, claim];
    await saveClaims(root, claims);
    if (!primaryEvidence) {
      await emit({ kind: "intervention.required", role: "system", title: "Review did not approve evidence", detail: item.review.summary });
      return void 0;
    }
    const synthesis = await item.agents.synthesize({ plan: item.plan, claim, evidence }, streamOptions("synthesizer", "synthesis"));
    const patchSnapshot = await loadProject(root);
    const projectForPatch = {
      ...snapshotToGateProject(patchSnapshot),
      evidence,
      claims
    };
    const patch = stageManuscriptPatch(projectForPatch, synthesis.body, {
      autoApprove: true,
      artifactTexts: loadArtifactTexts(root, evidence.filter((entry) => entry.validation === "valid" && entry.review !== "rejected"))
    });
    await savePatch(root, patch);
    await emit({ kind: "patch.staged", role: "synthesizer", title: "Patch staged", detail: patch.status });
    const current = await loadProject(root);
    const applied = applyPatchIfValid(current.manuscriptBody, patch);
    if (applied.applied) {
      await saveManuscript(root, applied.body);
      await savePatch(root, { ...patch, appliedAt: (/* @__PURE__ */ new Date()).toISOString() });
      await emit({ kind: "patch.applied", role: "synthesizer", title: "Patch applied", detail: synthesis.title });
    } else {
      await emit({ kind: "intervention.required", role: "system", title: "Patch blocked", detail: applied.reason ?? "Gate rejected patch." });
    }
    return patch;
  }
};
var maxStagedDataFileBytes = 64 * 1024 * 1024;
async function listProjectDataFiles(root) {
  try {
    const entries = await (0, import_promises5.readdir)((0, import_node_path5.join)(root, "data"), { withFileTypes: true });
    const names = [];
    for (const entry of entries) {
      if (!entry.isFile() || entry.name.startsWith("."))
        continue;
      const info = await (0, import_promises5.stat)((0, import_node_path5.join)(root, "data", entry.name));
      if (info.size <= maxStagedDataFileBytes)
        names.push(entry.name);
    }
    return names.sort();
  } catch {
    return [];
  }
}
async function stageProjectDataFiles(root, nodeDir, files) {
  if (files.length === 0)
    return;
  await (0, import_promises5.mkdir)((0, import_node_path5.join)(nodeDir, "data"), { recursive: true });
  for (const name of files) {
    await (0, import_promises5.cp)((0, import_node_path5.join)(root, "data", name), (0, import_node_path5.join)(nodeDir, "data", name), { force: true });
  }
}
async function acquireProjectRunLock(root, id) {
  const runtimeDir = (0, import_node_path5.join)(root, "runtime");
  const lockPath = (0, import_node_path5.join)(runtimeDir, "run.lock");
  await (0, import_promises5.mkdir)(runtimeDir, { recursive: true });
  const writeLock = async () => {
    await (0, import_promises5.writeFile)(lockPath, JSON.stringify({ id, pid: process.pid, startedAt: (/* @__PURE__ */ new Date()).toISOString() }, null, 2), { encoding: "utf8", flag: "wx" });
  };
  try {
    await writeLock();
  } catch (error) {
    if (error.code !== "EEXIST")
      throw error;
    const existing = await inspectProjectRunLock(lockPath);
    if (existing === "active") {
      throw new Error(`Another Nullius run is already active for this project: ${lockPath}`);
    }
    await (0, import_promises5.rm)(lockPath, { force: true });
    try {
      await writeLock();
    } catch (retryError) {
      if (retryError.code === "EEXIST") {
        throw new Error(`Another Nullius run is already active for this project: ${lockPath}`);
      }
      throw retryError;
    }
  }
  return async () => {
    try {
      const current = JSON.parse(await (0, import_promises5.readFile)(lockPath, "utf8"));
      if (current.id !== id)
        return;
    } catch {
      return;
    }
    await (0, import_promises5.rm)(lockPath, { force: true });
  };
}
async function inspectProjectRunLock(lockPath) {
  try {
    const lock = JSON.parse(await (0, import_promises5.readFile)(lockPath, "utf8"));
    return isLiveProcessId(lock.pid) ? "active" : "stale";
  } catch {
    return "stale";
  }
}
function isLiveProcessId(pid) {
  if (typeof pid !== "number" || !Number.isInteger(pid) || pid <= 0)
    return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    const code = error.code;
    return code === "EPERM";
  }
}
async function ensureLanesForApprovedPlans(root, snapshot, approvedPlans, emit) {
  for (const plan of approvedPlans) {
    if (snapshot.lanes.some((lane2) => lane2.planId === plan.id))
      continue;
    const lane = { id: (0, import_node_crypto3.randomUUID)(), name: plan.title, planId: plan.id, nodeOrder: [] };
    await saveLane(root, lane);
    await emit({ kind: "lane.created", role: "system", title: "Lane created", detail: lane.name });
  }
}
function selectEligibleLanes(snapshot, approvedPlans, limit) {
  const plansById = new Map(approvedPlans.map((plan) => [plan.id, plan]));
  return snapshot.lanes.flatMap((lane) => {
    const plan = plansById.get(lane.planId);
    if (!plan || !laneCanRun(lane))
      return [];
    return [{ lane, plan }];
  }).slice(0, limit);
}
function laneCanRun(lane) {
  const last = lane.nodes.at(-1);
  if (!last)
    return true;
  if (last.status === "running" || last.status === "waitingForUser" || last.status === "error")
    return false;
  if (last.review?.severity === "critical")
    return false;
  return last.status === "completed" || last.status === "settled";
}
function ensureProtocolLockFromPlan(manifest, plan) {
  if (manifest.protocolLock)
    return manifest;
  return {
    ...manifest,
    protocolLock: {
      researchQuestion: manifest.question,
      scope: plan.purpose,
      plannedObservables: plan.observables,
      successCriteria: plan.successCriteria,
      falsificationCriteria: plan.falsificationCriteria,
      requiredEvidence: ["approved evidence for every result claim"],
      exclusions: ["unsupported claims", "unapproved AI plans"],
      lockedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  };
}
async function consumeSteering(root) {
  const path = (0, import_node_path5.join)(root, "runtime", "steering.txt");
  try {
    const text = (await (0, import_promises5.readFile)(path, "utf8")).trim();
    await (0, import_promises5.rm)(path, { force: true });
    return text;
  } catch {
    return "";
  }
}
function withSteering(text, steering) {
  return steering ? `${text}

User steering instruction for this run:
${steering}` : text;
}
function withPlanSteering(plan, steering) {
  if (!steering)
    return plan;
  return { ...plan, method: `${plan.method}

User steering instruction for this run:
${steering}` };
}
function nodeNarrative2(node, detail) {
  return [`# ${node.title}`, "", `Status: ${node.status}`, "", "```python", node.generatedCode, "```", "", detail].join("\n");
}
var MockResearchAgents = class {
  fabricated;
  constructor(options = {}) {
    this.fabricated = options.fabricated ?? false;
  }
  async createPlan(question, options) {
    options?.onStream?.({ type: "content", text: "Planning synthetic slope check." });
    return {
      id: (0, import_node_crypto3.randomUUID)(),
      title: "Synthetic slope check",
      purpose: question,
      method: "Generate a small CSV artifact with a known slope.",
      observables: ["slope"],
      successCriteria: ["slope equals 2.0"],
      falsificationCriteria: ["slope differs from 2.0"],
      approved: false
    };
  }
  async createExecutorDraft(_plan, options) {
    options?.onStream?.({ type: "content", text: "Generating executor code." });
    return {
      title: "Fit slope",
      code: [
        "import os",
        "os.makedirs('artifacts', exist_ok=True)",
        "with open('artifacts/fit.csv', 'w') as f:",
        "    f.write('metric,value\\nslope,2.0\\n')",
        "print('slope 2.0')"
      ].join("\n"),
      claimText: "The fit slope is 2.0."
    };
  }
  async reviewNode(context, options) {
    options?.onStream?.({ type: "reasoning", text: context.exitCode === 0 ? "Artifact is present." : "Execution failed." });
    return {
      severity: context.exitCode === 0 ? "clear" : "critical",
      findings: context.exitCode === 0 ? ["Execution completed."] : [],
      concerns: context.exitCode === 0 ? [] : [context.stderr],
      summary: context.exitCode === 0 ? "Execution and artifact are consistent." : "Execution failed."
    };
  }
  async synthesize(_context, options) {
    options?.onStream?.({ type: "content", text: "Writing evidence-backed manuscript." });
    options?.onStream?.({ type: "usage", usage: { promptTokens: 10, completionTokens: 20, reasoningTokens: 3 } });
    const result = this.fabricated ? "9.4142" : "2.0";
    return {
      title: "Synthetic slope study",
      body: [
        "# Abstract",
        "We test a linear relation on synthetic data.",
        "# Introduction",
        "A deterministic synthetic fixture is used.",
        "# Methods",
        "Python code writes a CSV artifact and the manuscript only reports values grounded in that artifact.",
        "# Results",
        `The fit slope is ${result}.`,
        "# Discussion",
        "The output is accepted only when it is grounded in the generated artifact.",
        "# Limitations",
        "Synthetic data only.",
        "# References",
        "None."
      ].join("\n")
    };
  }
};

// ../core/dist/orchestrator/agents.js
var import_node_child_process2 = require("node:child_process");
var import_node_crypto4 = require("node:crypto");
var ExecutorDraftSchema = external_exports.object({
  title: external_exports.string().min(1),
  code: external_exports.string().min(1),
  claimText: external_exports.string().min(1)
});
var SynthesisDraftSchema = external_exports.object({
  title: external_exports.string().min(1),
  body: external_exports.string().min(1)
});
function createResearchAgentsFromManifest(manifest, options = {}) {
  const env = options.env ?? process.env;
  return new RoleSeparatedResearchAgents(manifest, env, options.terminalTimeoutMs ?? 18e4);
}
var RoleSeparatedResearchAgents = class {
  manifest;
  env;
  terminalTimeoutMs;
  constructor(manifest, env, terminalTimeoutMs) {
    this.manifest = manifest;
    this.env = env;
    this.terminalTimeoutMs = terminalTimeoutMs;
  }
  async createPlan(question, options) {
    const json = await this.completeStructured(this.manifest.roles.planner, "planner", [
      "You are the initial research planner for Nullius.",
      "Return only JSON matching this shape:",
      '{"id":"string","title":"string","purpose":"string","method":"string","observables":["string"],"successCriteria":["string"],"falsificationCriteria":["string"],"approved":false}',
      "Do not include expected results. Plan observables, evidence requirements, and falsification criteria."
    ].join("\n"), `Research question:
${question}`);
    const parsed = PlanSchema.parse({ id: (0, import_node_crypto4.randomUUID)(), ...asRecord(json), approved: false });
    return parsed;
  }
  async createExecutorDraft(plan, options) {
    const json = await this.completeStructured(this.manifest.roles.executor, "executor", [
      "You are the main executor for Nullius.",
      "Return only JSON matching this shape:",
      '{"title":"string","code":"python code string","claimText":"one result claim that the generated code can actually support"}',
      "The code must be self-contained, deterministic, network-free, and write at least one small artifact under artifacts/.",
      "If input data files are listed, read them from the relative path ./data/<name> and base the analysis on them instead of generating synthetic data.",
      "Do not fabricate results in claimText; it must be a claim that can be checked from the generated artifact."
    ].join("\n"), [
      `Approved protocol/plan:
${JSON.stringify(plan, null, 2)}`,
      options?.dataFiles?.length ? `Input data files available in the working directory: ${options.dataFiles.map((name) => `./data/${name}`).join(", ")}` : "No user-supplied data files; generate the data the plan requires."
    ].join("\n\n"));
    return ExecutorDraftSchema.parse(json);
  }
  async reviseExecutorDraft(context, options) {
    const json = await this.completeStructured(this.manifest.roles.executor, "selfCorrection", [
      "You are the main executor repairing a Nullius node after independent review.",
      "Return only JSON matching this shape:",
      '{"title":"string","code":"python code string","claimText":"one result claim that the generated code can actually support"}',
      "Fix the code or claim so the next execution can pass review. Do not fabricate outputs."
    ].join("\n"), `Approved plan, previous draft, execution result, and reviewer concerns:
${JSON.stringify(context, null, 2)}`, options);
    return ExecutorDraftSchema.parse(json);
  }
  async reviewNode(context, options) {
    const json = await this.completeStructured(this.manifest.roles.reviewer, "reviewer", [
      "You are the independent critical reviewer for Nullius.",
      "Return only JSON matching this shape:",
      '{"severity":"clear|info|warning|critical","findings":["string"],"concerns":["string"],"summary":"string"}',
      "Mark severity critical if execution failed, artifacts are missing, or the claim is unsupported."
    ].join("\n"), `Executor draft and execution result:
${JSON.stringify(context, null, 2)}`);
    return NodeReviewSchema.parse(json);
  }
  async synthesize(context, options) {
    const json = await this.completeStructured(this.manifest.roles.executor, "synthesizer", [
      "You are the manuscript synthesizer for Nullius.",
      "Return only JSON matching this shape:",
      '{"title":"string","body":"markdown manuscript string"}',
      "The manuscript must contain Abstract, Introduction, Methods, Results, Discussion, Limitations, and References sections.",
      "Only report numbers and claims that are present in the supplied evidence. Do not mention internal words such as node, lane, agent, patch, supportref, evidence_id, or claim_id."
    ].join("\n"), `Plan, approved claim, and evidence:
${JSON.stringify(context, null, 2)}`);
    return SynthesisDraftSchema.parse(json);
  }
  async completeStructured(role, purpose, systemPrompt, userPrompt, options) {
    if (role.provider === "codexCli" || role.provider === "claudeCode" || role.provider === "opencode") {
      options?.onCall?.({ systemPrompt, userPrompt });
      const result = await runTerminalJSONAgent(role, purpose, systemPrompt, userPrompt, this.env, this.terminalTimeoutMs, options);
      options?.onResponse?.(JSON.stringify(result));
      return result;
    }
    const config = providerConfigFromRole(role, this.env);
    options?.onCall?.({ systemPrompt, userPrompt });
    const parsed = await completeJSON(systemPrompt, userPrompt, config, options?.onStream ? { stream: options.onStream } : {});
    options?.onResponse?.(typeof parsed === "string" ? parsed : JSON.stringify(parsed));
    return parsed;
  }
};
function asRecord(value) {
  if (typeof value === "object" && value !== null && !Array.isArray(value))
    return value;
  throw new Error("Agent returned a non-object JSON value.");
}
function providerConfigFromRole(role, env = process.env) {
  switch (role.provider) {
    case "openrouter":
      return {
        kind: "openrouter",
        model: role.model,
        apiKey: requireEnv(env, "OPENROUTER_API_KEY"),
        reasoningEffort: role.reasoningEffort
      };
    case "openai":
      return {
        kind: "openai",
        model: role.model,
        apiKey: requireEnv(env, "OPENAI_API_KEY"),
        reasoningEffort: role.reasoningEffort
      };
    case "anthropic":
      return {
        kind: "anthropic",
        model: role.model,
        apiKey: requireEnv(env, "ANTHROPIC_API_KEY"),
        reasoningEffort: role.reasoningEffort
      };
    case "customOpenAICompatible":
      return {
        kind: "customOpenAICompatible",
        model: role.model,
        apiKey: requireEnv(env, "CUSTOM_OPENAI_API_KEY"),
        baseURL: requireEnv(env, "CUSTOM_OPENAI_BASE_URL"),
        reasoningEffort: role.reasoningEffort
      };
    case "codexCli":
    case "claudeCode":
    case "opencode":
      throw new Error(`${role.provider} is a terminal agent, not an API provider.`);
  }
}
function requireEnv(env, name) {
  const value = env[name];
  if (!value)
    throw new Error(`${name} is required for this provider.`);
  return value;
}
async function runTerminalJSONAgent(role, purpose, systemPrompt, userPrompt, env, timeoutMs, options) {
  const prompt = [
    systemPrompt,
    "",
    "Return a single JSON object. No Markdown fences. No commentary.",
    "",
    userPrompt
  ].join("\n");
  const command = terminalCommand(role, purpose, prompt);
  const result = await runProcess(command.cmd, command.args, env, timeoutMs, options);
  if (result.exitCode !== 0) {
    throw new Error(`${role.provider} failed with exit code ${result.exitCode}: ${result.stderr || result.stdout}`);
  }
  return parseJSONFromResponse(result.stdout || result.stderr);
}
function terminalCommand(role, purpose, prompt) {
  switch (role.provider) {
    case "codexCli":
      return {
        cmd: "codex",
        args: ["exec", "--json", "--model", role.model, prompt]
      };
    case "claudeCode":
      return {
        cmd: "claude",
        args: ["-p", prompt, "--model", role.model, "--output-format", "text"]
      };
    case "opencode":
      return {
        cmd: "opencode",
        args: ["run", "--model", role.model, "--prompt", prompt]
      };
    default:
      throw new Error(`Unsupported terminal provider for ${purpose}: ${role.provider}`);
  }
}
function runProcess(cmd, args, env, timeoutMs, options) {
  return new Promise((resolve) => {
    const child = (0, import_node_child_process2.spawn)(cmd, args, { env: { ...env }, stdio: ["ignore", "pipe", "pipe"] });
    const stdout = [];
    const stderr = [];
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve({ exitCode: 124, stdout: Buffer.concat(stdout).toString("utf8"), stderr: `${Buffer.concat(stderr).toString("utf8")}
terminal agent timed out` });
    }, timeoutMs);
    child.stdout.on("data", (chunk) => {
      stdout.push(chunk);
      options?.onStream?.({ type: "content", text: chunk.toString("utf8") });
    });
    child.stderr.on("data", (chunk) => {
      stderr.push(chunk);
      options?.onStream?.({ type: "reasoning", text: chunk.toString("utf8") });
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ exitCode: 127, stdout: Buffer.concat(stdout).toString("utf8"), stderr: String(error) });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ exitCode: code ?? 1, stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8") });
    });
  });
}

// ../core/dist/activity/activityJournal.js
var import_promises6 = require("node:fs/promises");
var import_node_path6 = require("node:path");
var ActivitySourceSchema = external_exports.enum(["gui", "cli", "server", "core", "externalAgent", "gate", "sandbox", "reviewer"]);
var ActivityRoleSchema = external_exports.enum(["planner", "executor", "reviewer", "synthesizer", "system", "user"]);
var ActivitySeveritySchema = external_exports.enum(["ok", "warning", "critical"]);
var ActivityJournalEventSchema = external_exports.object({
  seq: external_exports.number().int().positive(),
  ts: external_exports.string(),
  source: ActivitySourceSchema,
  actor: external_exports.string(),
  role: ActivityRoleSchema,
  phase: external_exports.string(),
  title: external_exports.string(),
  detail: external_exports.string().optional(),
  severity: ActivitySeveritySchema.default("ok"),
  command: external_exports.string().optional(),
  exitCode: external_exports.number().int().nullable().optional(),
  projectRoot: external_exports.string(),
  runId: external_exports.string().optional()
});
function activityJournalPath(root) {
  return (0, import_node_path6.join)(root, "runtime", "events.jsonl");
}
async function appendActivityEvent(root, input) {
  await (0, import_promises6.mkdir)((0, import_node_path6.join)(root, "runtime"), { recursive: true });
  const event = ActivityJournalEventSchema.parse({
    seq: input.seq ?? await nextActivitySeq(root),
    ts: input.ts ?? (/* @__PURE__ */ new Date()).toISOString(),
    source: input.source,
    actor: input.actor,
    role: input.role,
    phase: input.phase,
    title: input.title,
    ...input.detail === void 0 ? {} : { detail: input.detail },
    severity: input.severity ?? "ok",
    ...input.command === void 0 ? {} : { command: input.command },
    ...input.exitCode === void 0 ? {} : { exitCode: input.exitCode },
    projectRoot: input.projectRoot ?? root,
    ...input.runId === void 0 ? {} : { runId: input.runId }
  });
  const path = activityJournalPath(root);
  const prefix = await needsLeadingNewline(path);
  await (0, import_promises6.appendFile)(path, `${prefix}${JSON.stringify(event)}
`, "utf8");
  return event;
}
async function readActivityEvents(root, options = {}) {
  let text = "";
  try {
    text = await (0, import_promises6.readFile)(activityJournalPath(root), "utf8");
  } catch {
    return [];
  }
  const events = [];
  for (const line of text.split(/\n/)) {
    if (!line.trim())
      continue;
    try {
      events.push(ActivityJournalEventSchema.parse(JSON.parse(line)));
    } catch {
    }
  }
  return options.limit && events.length > options.limit ? events.slice(-options.limit) : events;
}
async function nextActivitySeq(root) {
  const events = await readActivityEvents(root);
  return events.reduce((max, event) => Math.max(max, event.seq), 0) + 1;
}
async function needsLeadingNewline(path) {
  try {
    const text = await (0, import_promises6.readFile)(path, "utf8");
    return text.length > 0 && !text.endsWith("\n") ? "\n" : "";
  } catch {
    return "";
  }
}
function activityFromFullAutoEvent(root, event, context) {
  return {
    source: sourceForFullAutoEvent(context.source, event),
    actor: context.actor,
    role: event.role,
    phase: event.kind,
    title: event.title,
    ...event.detail === void 0 ? {} : { detail: event.detail },
    severity: severityForFullAutoEvent(event),
    ...context.command === void 0 ? {} : { command: context.command },
    projectRoot: root,
    ...context.runId === void 0 ? {} : { runId: context.runId }
  };
}
function activityFromStreamEvent(root, event, context) {
  return {
    source: event.role === "reviewer" ? "reviewer" : context.source,
    actor: context.actor,
    role: event.role,
    phase: `stream.${event.kind}`,
    title: `${event.role} ${event.purpose}`,
    detail: event.text ?? (event.usage ? JSON.stringify(event.usage) : event.kind),
    severity: "ok",
    ...context.command === void 0 ? {} : { command: context.command },
    projectRoot: root,
    runId: event.runId
  };
}
function severityForFullAutoEvent(event) {
  if (event.kind === "intervention.required")
    return "warning";
  if (event.kind === "node.executed" && /failed|error/i.test(`${event.title}
${event.detail ?? ""}`))
    return "critical";
  if (event.kind === "run.completed" && /not ready/i.test(event.detail ?? ""))
    return "warning";
  return "ok";
}
function sourceForFullAutoEvent(source, event) {
  if (event.role === "reviewer")
    return "reviewer";
  if (event.kind === "node.executed")
    return "sandbox";
  if (event.kind === "patch.applied" || event.kind === "patch.staged")
    return "gate";
  return source;
}

// ../server/dist/index.js
var import_node_child_process3 = require("node:child_process");
var import_node_http = require("node:http");
var import_node_crypto5 = require("node:crypto");
var import_promises7 = require("node:fs/promises");
var import_node_path7 = require("node:path");
var import_node_os2 = require("node:os");

// ../../node_modules/.pnpm/ws@8.21.0/node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_extension = __toESM(require_extension(), 1);
var import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_subprotocol = __toESM(require_subprotocol(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);

// ../server/dist/index.js
var ServerCommandSchema = external_exports.object({
  schemaVersion: external_exports.literal(1),
  command: external_exports.enum([
    "project.open",
    "project.create",
    "plan.generate",
    "plan.adopt",
    "run.start",
    "run.stop",
    "run.resume",
    "run.steer",
    "patch.approve",
    "patch.reject",
    "gates.verify",
    "citations.verify",
    "citations.search",
    "repro.check",
    "node.rerun",
    "export.markdown",
    "keys.set",
    "keys.status",
    "data.import",
    "data.list",
    "patch.preview",
    "demo.seed",
    "project.configure",
    "activity.watch",
    "activity.list"
  ]),
  payload: external_exports.unknown().optional()
});
var CreateProjectPayload = external_exports.object({
  root: external_exports.string(),
  manifest: ProjectManifestSchema
});
var RootPayload = external_exports.object({
  root: external_exports.string()
});
var VerifyPayload = external_exports.object({
  root: external_exports.string(),
  depth: external_exports.enum(["quick", "standard", "deep"]).default("standard")
});
var PatchPayload = external_exports.object({
  root: external_exports.string(),
  patchId: external_exports.string()
});
var RunPayload = external_exports.object({
  root: external_exports.string(),
  mock: external_exports.boolean().default(false),
  mockFabricated: external_exports.boolean().default(false),
  backend: external_exports.enum(["auto", "pyodide", "sandboxExec", "docker"]).default("auto")
});
var PlanAdoptPayload = external_exports.object({
  root: external_exports.string(),
  planId: external_exports.string()
});
var SteerPayload = external_exports.object({
  root: external_exports.string(),
  instruction: external_exports.string()
});
var SearchCitationPayload = external_exports.object({
  query: external_exports.string(),
  rows: external_exports.number().int().positive().max(20).default(5)
});
var NodePayload = external_exports.object({
  root: external_exports.string(),
  nodeId: external_exports.string()
});
var DataImportPayload = external_exports.object({
  root: external_exports.string(),
  files: external_exports.array(external_exports.string()).min(1)
});
var RoleConfigSchema = external_exports.object({
  provider: external_exports.enum(["openrouter", "openai", "anthropic", "customOpenAICompatible"]),
  model: external_exports.string().min(1),
  reasoningEffort: external_exports.enum(["none", "low", "medium", "high"]).default("none")
});
var ProjectConfigurePayload = external_exports.object({
  root: external_exports.string(),
  roles: external_exports.object({
    planner: RoleConfigSchema,
    executor: RoleConfigSchema,
    reviewer: RoleConfigSchema
  })
});
var KeysSetPayload = external_exports.object({
  provider: external_exports.enum(["openrouter", "openai", "anthropic", "customOpenAICompatible"]),
  apiKey: external_exports.string().min(1),
  persist: external_exports.boolean().default(true)
});
async function startNulliusServer(options = {}) {
  const clients = /* @__PURE__ */ new Set();
  const activeRuns = /* @__PURE__ */ new Map();
  const activityWatchers = /* @__PURE__ */ new Map();
  const sessionKeys = /* @__PURE__ */ new Map();
  const resolveAgentEnv = async () => {
    const env = await envWithKeychain();
    for (const [provider, apiKey] of sessionKeys) {
      const envName = providerEnvNames()[provider];
      if (envName)
        env[envName] = apiKey;
    }
    return env;
  };
  const broadcast = (event) => {
    const payload = JSON.stringify(event);
    for (const client of clients) {
      if (client.readyState === client.OPEN)
        client.send(payload);
    }
  };
  const activityEventKey = (event) => `${event.seq}:${event.ts}:${event.source}:${event.phase}:${event.title}`;
  const markActivitySeen = (root, event) => {
    const watcher = activityWatchers.get(root);
    if (watcher)
      watcher.seen.add(activityEventKey(event));
  };
  const broadcastActivity = (event) => {
    markActivitySeen(event.projectRoot, event);
    broadcast({ schemaVersion: 1, type: "activity.event", event });
  };
  const recordActivity = async (root, input) => {
    const event = await appendActivityEvent(root, input);
    broadcastActivity(event);
    return event;
  };
  const startActivityWatch = async (root) => {
    const existing = await readActivityEvents(root, { limit: 500 });
    const active = activityWatchers.get(root);
    if (active) {
      for (const event of existing)
        active.seen.add(activityEventKey(event));
      return existing;
    }
    const seen = new Set(existing.map(activityEventKey));
    const watcher = {
      seen,
      timer: setInterval(() => {
        void (async () => {
          const events = await readActivityEvents(root, { limit: 1e3 });
          const next = events.filter((event) => !watcher.seen.has(activityEventKey(event))).sort((a, b) => a.seq - b.seq || a.ts.localeCompare(b.ts));
          if (next.length === 0)
            return;
          for (const event of next) {
            watcher.seen.add(activityEventKey(event));
            broadcastActivity(event);
          }
          await broadcastStateChanged("activity.watch", root);
        })().catch(() => void 0);
      }, 500)
    };
    activityWatchers.set(root, watcher);
    return existing;
  };
  const broadcastStateChanged = async (commandName, root) => {
    let readiness;
    try {
      const snapshot = await loadProject(root);
      readiness = readinessReport(snapshotToGateProject(snapshot), snapshot.manifest.settings.depth, projectGateIO(root));
    } catch {
      readiness = void 0;
    }
    broadcast({ schemaVersion: 1, type: "state.changed", command: commandName, root, readiness });
  };
  const command = async (message) => {
    const parsed = ServerCommandSchema.parse(message);
    switch (parsed.command) {
      case "project.create": {
        const payload = CreateProjectPayload.parse(parsed.payload);
        await createProject(payload.root, payload.manifest);
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "system",
          phase: "project.create.completed",
          title: "Project created",
          detail: payload.manifest.question,
          command: parsed.command
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true };
      }
      case "project.open": {
        const payload = RootPayload.parse(parsed.payload);
        return loadProject(payload.root);
      }
      case "gates.verify": {
        const payload = VerifyPayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        const readiness = readinessReport(snapshotToGateProject(snapshot), payload.depth, projectGateIO(payload.root));
        await recordActivity(payload.root, {
          source: "gate",
          actor: "gui",
          role: "system",
          phase: "gates.verify.completed",
          title: readiness.ready ? "Gates passed" : "Gates not ready",
          detail: `readiness=${Math.round(readiness.readinessScore * 100)}%`,
          severity: readiness.ready ? "ok" : "warning",
          command: parsed.command,
          exitCode: readiness.ready ? 0 : 1
        });
        return { ok: true, readiness };
      }
      case "run.start": {
        const payload = RunPayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        const controller = new AbortController();
        activeRuns.set(payload.root, controller);
        broadcast({ schemaVersion: 1, type: "run.started", root: payload.root, source: "gui" });
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "system",
          phase: "run.start.started",
          title: "Full Auto started",
          command: parsed.command
        });
        const result = await new FullAutoOrchestrator({ backend: executionBackendFor(payload.backend) }).runOnce(payload.root, payload.mock || payload.mockFabricated ? new MockResearchAgents({ fabricated: payload.mockFabricated }) : createResearchAgentsFromManifest(snapshot.manifest, { env: await resolveAgentEnv() }), (event) => {
          broadcast({ schemaVersion: 1, type: "run.event", event });
          void recordActivity(payload.root, activityFromFullAutoEvent(payload.root, event, { source: "gui", actor: "gui", command: parsed.command }));
          if (event.kind === "intervention.required")
            broadcast({ schemaVersion: 1, type: "intervention.required", event, root: payload.root });
        }, {
          signal: controller.signal,
          onStream: (event) => {
            broadcast({ schemaVersion: 1, type: "stream.delta", ...event, root: payload.root });
            void recordActivity(payload.root, activityFromStreamEvent(payload.root, event, { source: "gui", actor: "gui", command: parsed.command }));
          }
        });
        activeRuns.delete(payload.root);
        broadcast({ schemaVersion: 1, type: "run.finished", root: payload.root });
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "system",
          phase: "run.start.completed",
          title: result.ready ? "Full Auto completed" : "Full Auto completed: not ready",
          severity: result.ready ? "ok" : "warning",
          command: parsed.command,
          exitCode: result.ready ? 0 : 1,
          runId: result.runId
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return result;
      }
      case "run.resume": {
        const payload = RunPayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        const controller = new AbortController();
        activeRuns.set(payload.root, controller);
        broadcast({ schemaVersion: 1, type: "run.started", root: payload.root, source: "gui" });
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "system",
          phase: "run.resume.started",
          title: "Full Auto resumed",
          command: parsed.command
        });
        const result = await new FullAutoOrchestrator({ backend: executionBackendFor(payload.backend) }).runOnce(payload.root, payload.mock || payload.mockFabricated ? new MockResearchAgents({ fabricated: payload.mockFabricated }) : createResearchAgentsFromManifest(snapshot.manifest, { env: await resolveAgentEnv() }), (event) => {
          broadcast({ schemaVersion: 1, type: "run.event", event });
          void recordActivity(payload.root, activityFromFullAutoEvent(payload.root, event, { source: "gui", actor: "gui", command: parsed.command }));
          if (event.kind === "intervention.required")
            broadcast({ schemaVersion: 1, type: "intervention.required", event, root: payload.root });
        }, {
          signal: controller.signal,
          onStream: (event) => {
            broadcast({ schemaVersion: 1, type: "stream.delta", ...event, root: payload.root });
            void recordActivity(payload.root, activityFromStreamEvent(payload.root, event, { source: "gui", actor: "gui", command: parsed.command }));
          }
        });
        activeRuns.delete(payload.root);
        broadcast({ schemaVersion: 1, type: "run.finished", root: payload.root });
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "system",
          phase: "run.resume.completed",
          title: result.ready ? "Full Auto resumed and completed" : "Full Auto resumed: not ready",
          severity: result.ready ? "ok" : "warning",
          command: parsed.command,
          exitCode: result.ready ? 0 : 1,
          runId: result.runId
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return result;
      }
      case "run.stop": {
        const payload = RootPayload.parse(parsed.payload);
        const controller = activeRuns.get(payload.root);
        if (!controller)
          return { ok: true, stopped: false, reason: "No active run for this project." };
        controller.abort();
        activeRuns.delete(payload.root);
        broadcast({ schemaVersion: 1, type: "run.finished", root: payload.root });
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "system",
          phase: "run.stop.completed",
          title: "Stop requested",
          command: parsed.command
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, stopped: true };
      }
      case "run.steer": {
        const payload = SteerPayload.parse(parsed.payload);
        await (0, import_promises7.mkdir)((0, import_node_path7.join)(payload.root, "runtime"), { recursive: true });
        await (0, import_promises7.writeFile)((0, import_node_path7.join)(payload.root, "runtime", "steering.txt"), `${payload.instruction}
`, "utf8");
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "user",
          phase: "run.steer.completed",
          title: "Steering instruction saved",
          detail: payload.instruction,
          command: parsed.command
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true };
      }
      case "plan.generate": {
        const payload = RootPayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "planner",
          phase: "plan.generate.started",
          title: "Generating plan",
          command: parsed.command
        });
        const plan = await createResearchAgentsFromManifest(snapshot.manifest, { env: await resolveAgentEnv() }).createPlan(snapshot.manifest.question);
        await savePlan(payload.root, plan);
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "planner",
          phase: "plan.generate.completed",
          title: "Plan generated",
          detail: plan.title,
          command: parsed.command
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, plan };
      }
      case "plan.adopt": {
        const payload = PlanAdoptPayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        const selected = snapshot.plans.find((plan) => plan.id === payload.planId);
        if (!selected)
          return { ok: false, reason: `Plan not found: ${payload.planId}` };
        const adopted = { ...selected, approved: true };
        await savePlan(payload.root, adopted);
        const manifest = {
          ...snapshot.manifest,
          protocolLock: snapshot.manifest.protocolLock ?? {
            researchQuestion: snapshot.manifest.question,
            scope: adopted.purpose,
            plannedObservables: adopted.observables,
            successCriteria: adopted.successCriteria,
            falsificationCriteria: adopted.falsificationCriteria,
            requiredEvidence: ["approved evidence for every result claim"],
            exclusions: ["unsupported claims"],
            lockedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        };
        await saveManifest(payload.root, manifest);
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "user",
          phase: "plan.adopt.completed",
          title: "Plan adopted",
          detail: adopted.title,
          command: parsed.command
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, plan: adopted };
      }
      case "demo.seed": {
        const root = (0, import_node_path7.join)((0, import_node_os2.tmpdir)(), `nullius-demo-${(0, import_node_crypto5.randomUUID)().slice(0, 8)}`);
        await createProject(root, {
          schemaVersion: 1,
          name: "Nullius demo",
          question: "In data/measurements.csv, is y consistent with a linear relation y = a*x + b, and what is the slope a?",
          roles: {
            planner: { provider: "openrouter", model: "openrouter/auto", reasoningEffort: "none" },
            executor: { provider: "openrouter", model: "openrouter/auto", reasoningEffort: "none" },
            reviewer: { provider: "openrouter", model: "openrouter/auto", reasoningEffort: "none" }
          },
          settings: { maxLanes: 1, maxNodes: 3, depth: "quick", sandboxPolicy: "required", selfCorrectionRounds: 1 },
          amendments: []
        });
        const rows = ["x,y"];
        for (let i = 0; i < 40; i += 1) {
          const x = i * 0.5;
          const noise = 0.3 * Math.sin(i * 12.9898) * Math.cos(i * 78.233);
          rows.push(`${x.toFixed(2)},${(2 * x + 1 + noise).toFixed(4)}`);
        }
        await (0, import_promises7.mkdir)((0, import_node_path7.join)(root, "data"), { recursive: true });
        await (0, import_promises7.writeFile)((0, import_node_path7.join)(root, "data", "measurements.csv"), rows.join("\n") + "\n", "utf8");
        await broadcastStateChanged(parsed.command, root);
        return { ok: true, root };
      }
      case "patch.preview": {
        const payload = PatchPayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        const patch = snapshot.patches.find((candidate) => candidate.id === payload.patchId);
        if (!patch)
          return { ok: false, reason: `Patch not found: ${payload.patchId}` };
        const simulated = patch.status === "approved" ? patch : { ...patch, status: "approved" };
        const result = applyPatchIfValid(snapshot.manuscriptBody, simulated);
        return {
          ok: true,
          wouldApply: result.applied,
          reason: result.reason,
          currentBody: snapshot.manuscriptBody,
          previewBody: result.applied ? result.body : patch.newBody
        };
      }
      case "patch.approve": {
        const payload = PatchPayload.parse(parsed.payload);
        const result = await approvePatch(payload.root, payload.patchId);
        await recordActivity(payload.root, {
          source: "gate",
          actor: "gui",
          role: "user",
          phase: "patch.approve.completed",
          title: result.applied ? "Patch applied" : "Patch approval blocked",
          detail: result.applied ? payload.patchId : result.reason ?? payload.patchId,
          severity: result.applied ? "ok" : "warning",
          command: parsed.command,
          exitCode: result.applied ? 0 : 1
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return result;
      }
      case "patch.reject": {
        const payload = PatchPayload.parse(parsed.payload);
        const patch = await rejectPatch(payload.root, payload.patchId);
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "user",
          phase: "patch.reject.completed",
          title: "Patch rejected",
          detail: patch.id,
          command: parsed.command
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, patch };
      }
      case "export.markdown": {
        const payload = RootPayload.parse(parsed.payload);
        const body = await exportMarkdown(payload.root);
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "system",
          phase: "export.markdown.completed",
          title: "Markdown exported",
          detail: `${body.length} characters`,
          command: parsed.command
        });
        return { body };
      }
      case "data.import": {
        const payload = DataImportPayload.parse(parsed.payload);
        const dataDir = (0, import_node_path7.join)(payload.root, "data");
        await (0, import_promises7.mkdir)(dataDir, { recursive: true });
        const imported = [];
        for (const file of payload.files) {
          const name = (0, import_node_path7.basename)(file);
          if (!name || name.startsWith("."))
            continue;
          await (0, import_promises7.cp)(file, (0, import_node_path7.join)(dataDir, name), { force: true });
          imported.push(name);
        }
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "user",
          phase: "data.import.completed",
          title: "Data files imported",
          detail: imported.join(", ") || "No files imported",
          severity: imported.length > 0 ? "ok" : "warning",
          command: parsed.command,
          exitCode: imported.length > 0 ? 0 : 1
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, imported, files: await listProjectDataFiles(payload.root) };
      }
      case "data.list": {
        const payload = RootPayload.parse(parsed.payload);
        return { ok: true, files: await listProjectDataFiles(payload.root) };
      }
      case "project.configure": {
        const payload = ProjectConfigurePayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        await saveManifest(payload.root, { ...snapshot.manifest, roles: payload.roles });
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "system",
          phase: "project.configure.completed",
          title: "Model settings saved",
          detail: `planner=${payload.roles.planner.model}; executor=${payload.roles.executor.model}; reviewer=${payload.roles.reviewer.model}`,
          command: parsed.command
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true };
      }
      case "keys.set": {
        const payload = KeysSetPayload.parse(parsed.payload);
        if (payload.persist && process.platform === "darwin") {
          const result = await runCapture("security", ["add-generic-password", "-a", "nullius", "-s", keychainService(payload.provider), "-w", payload.apiKey, "-U"]);
          if (result.exitCode === 0) {
            sessionKeys.delete(payload.provider);
            return { ok: true, stored: "keychain" };
          }
        }
        sessionKeys.set(payload.provider, payload.apiKey);
        return { ok: true, stored: "session" };
      }
      case "keys.status": {
        const status = {};
        for (const [provider, envName] of Object.entries(providerEnvNames())) {
          if (sessionKeys.has(provider)) {
            status[provider] = "session";
            continue;
          }
          if (process.env[envName]) {
            status[provider] = "env";
            continue;
          }
          if (process.platform === "darwin") {
            const result = await runCapture("security", ["find-generic-password", "-a", "nullius", "-s", keychainService(provider), "-w"]);
            if (result.exitCode === 0 && result.stdout.trim()) {
              status[provider] = "keychain";
              continue;
            }
          }
          status[provider] = "none";
        }
        return { ok: true, status };
      }
      case "citations.verify": {
        const payload = RootPayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        const verified = await Promise.all(snapshot.literature.map((item) => verifyLiteratureItem(item)));
        await saveLiterature(payload.root, verified);
        const rejected2 = verified.filter((item) => item.status === "rejected" || item.status === "retracted").length;
        await recordActivity(payload.root, {
          source: "gate",
          actor: "gui",
          role: "system",
          phase: "citations.verify.completed",
          title: rejected2 > 0 ? "Citation verification found issues" : "Citations verified",
          detail: `${verified.length} literature item(s), ${rejected2} rejected/retracted`,
          severity: rejected2 > 0 ? "warning" : "ok",
          command: parsed.command,
          exitCode: rejected2 > 0 ? 1 : 0
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, literature: verified };
      }
      case "citations.search": {
        const payload = SearchCitationPayload.parse(parsed.payload);
        return { ok: true, results: await searchCrossref(payload.query, payload.rows) };
      }
      case "repro.check": {
        const payload = RootPayload.parse(parsed.payload);
        const result = await checkProjectReproducibility(payload.root);
        await recordActivity(payload.root, {
          source: "sandbox",
          actor: "gui",
          role: "system",
          phase: "repro.check.completed",
          title: result.failed === 0 && result.divergent === 0 ? "Reproducibility check passed" : "Reproducibility check found issues",
          detail: `failed=${result.failed}; divergent=${result.divergent}`,
          severity: result.failed === 0 && result.divergent === 0 ? "ok" : "warning",
          command: parsed.command,
          exitCode: result.failed === 0 && result.divergent === 0 ? 0 : 1
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: result.failed === 0 && result.divergent === 0, ...result };
      }
      case "node.rerun": {
        const payload = NodePayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        const lane = snapshot.lanes.find((candidate) => candidate.nodes.some((node2) => node2.id === payload.nodeId));
        const node = lane?.nodes.find((candidate) => candidate.id === payload.nodeId);
        if (!lane || !node)
          return { ok: false, reason: `Node not found: ${payload.nodeId}` };
        const started = Date.now();
        const result = await defaultExecutionBackend().run(node.generatedCode, (0, import_node_path7.join)(payload.root, "lanes", lane.id, "nodes", node.id), { allowNetwork: false, timeoutSec: 30 });
        const updated = {
          ...node,
          status: result.status === "succeeded" ? "completed" : "error",
          reproducibility: result.status === "succeeded" ? "reproduced" : "failed",
          executionRecord: {
            exitCode: result.exitCode,
            startedAt: new Date(started).toISOString(),
            durationMs: Date.now() - started,
            backend: result.backend
          }
        };
        await saveNode(payload.root, lane.id, updated, [`# ${updated.title}`, "", `Status: ${updated.status}`, "", "```python", updated.generatedCode, "```", "", result.stdout || result.stderr].join("\n"));
        await saveLane(payload.root, { id: lane.id, name: lane.name, planId: lane.planId, nodeOrder: lane.nodeOrder.includes(updated.id) ? lane.nodeOrder : [...lane.nodeOrder, updated.id] });
        await recordActivity(payload.root, {
          source: "sandbox",
          actor: "gui",
          role: "executor",
          phase: "node.rerun.completed",
          title: result.status === "succeeded" ? "Node rerun completed" : "Node rerun failed",
          detail: updated.title,
          severity: result.status === "succeeded" ? "ok" : "critical",
          command: parsed.command,
          exitCode: result.exitCode
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, node: updated, execution: result };
      }
      case "activity.watch": {
        const payload = RootPayload.parse(parsed.payload);
        const events = await startActivityWatch(payload.root);
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, events };
      }
      case "activity.list": {
        const payload = RootPayload.parse(parsed.payload);
        const events = await readActivityEvents(payload.root, { limit: 500 });
        return { ok: true, events };
      }
    }
  };
  const http = (0, import_node_http.createServer)(async (request, response) => {
    try {
      await handleRequest(request, response, command);
    } catch (error) {
      response.statusCode = 500;
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ ok: false, error: String(error) }));
    }
  });
  const ws = new import_websocket_server.default({ server: http });
  ws.on("connection", (socket) => {
    clients.add(socket);
    socket.on("close", () => clients.delete(socket));
  });
  await new Promise((resolve, reject) => {
    http.once("error", reject);
    http.listen(options.port ?? 0, "127.0.0.1", () => {
      http.off("error", reject);
      resolve();
    });
  });
  const address = http.address();
  const port = typeof address === "object" && address ? address.port : options.port ?? 0;
  return {
    port,
    http,
    ws,
    close: async () => {
      for (const watcher of activityWatchers.values())
        clearInterval(watcher.timer);
      activityWatchers.clear();
      for (const client of clients)
        client.close();
      ws.close();
      await new Promise((resolve, reject) => http.close((error) => error ? reject(error) : resolve()));
    },
    command
  };
}
async function handleRequest(request, response, command) {
  setCors(response, request);
  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }
  if (request.method === "GET" && request.url === "/health") {
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ ok: true }));
    return;
  }
  if (request.method !== "POST" || request.url !== "/command") {
    response.statusCode = 404;
    response.end("not found");
    return;
  }
  const body = await readBody(request);
  const result = await command(ServerCommandSchema.parse(JSON.parse(body)));
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify({ ok: true, result }));
}
function setCors(response, request) {
  const origin = request?.headers.origin;
  const allowedOrigin = allowedCorsOrigin(origin);
  if (allowedOrigin)
    response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
function allowedCorsOrigin(origin) {
  if (!origin)
    return "http://127.0.0.1";
  if (origin === "tauri://localhost" || origin === "http://tauri.localhost")
    return origin;
  if (/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin))
    return origin;
  return void 0;
}
async function readBody(request) {
  const chunks = [];
  for await (const chunk of request)
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}
async function searchCrossref(query, rows) {
  const response = await fetch(`https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(query)}&rows=${rows}`);
  if (!response.ok)
    return [];
  const body = await response.json();
  return (body.message?.items ?? []).map((item) => ({
    id: (0, import_node_crypto5.randomUUID)(),
    title: Array.isArray(item.title) ? item.title[0] : "",
    authors: Array.isArray(item.author) ? item.author.map((author) => typeof author === "object" && author && "family" in author ? String(author.family) : "").filter(Boolean).join(", ") : "",
    year: String(readCrossrefYear(item) ?? ""),
    doi: typeof item.DOI === "string" ? item.DOI : void 0,
    url: typeof item.URL === "string" ? item.URL : void 0,
    citationKey: makeCitationKey(item),
    status: "unverified",
    notes: ""
  }));
}
function readCrossrefYear(item) {
  const issued = item.issued;
  return issued?.["date-parts"]?.[0]?.[0];
}
function makeCitationKey(item) {
  const firstAuthor = Array.isArray(item.author) && typeof item.author[0] === "object" && item.author[0] && "family" in item.author[0] ? String(item.author[0].family) : "source";
  const year = readCrossrefYear(item) ?? "nd";
  return `${firstAuthor.toLowerCase().replace(/[^a-z0-9]+/g, "")}${year}`;
}
async function envWithKeychain() {
  const env = { ...process.env };
  if (process.platform !== "darwin")
    return env;
  for (const [provider, envName] of Object.entries(providerEnvNames())) {
    if (env[envName])
      continue;
    const result = await runCapture("security", ["find-generic-password", "-a", "nullius", "-s", keychainService(provider), "-w"]);
    if (result.exitCode === 0 && result.stdout.trim())
      env[envName] = result.stdout.trim();
  }
  return env;
}
function providerEnvNames() {
  return {
    openrouter: "OPENROUTER_API_KEY",
    openai: "OPENAI_API_KEY",
    anthropic: "ANTHROPIC_API_KEY",
    customOpenAICompatible: "CUSTOM_OPENAI_API_KEY"
  };
}
function keychainService(provider) {
  return `nullius:${provider}`;
}
function runCapture(command, args) {
  return new Promise((resolve) => {
    const child = (0, import_node_child_process3.spawn)(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", (error) => resolve({ exitCode: 127, stdout: Buffer.concat(stdout).toString("utf8"), stderr: String(error) }));
    child.on("close", (code) => resolve({ exitCode: code ?? 1, stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8") }));
  });
}

// src/list.ts
var LIST_SCHEMA_VERSION = 1;
var listKinds = ["plans", "patches", "nodes", "claims", "evidence"];
function isListKind(value) {
  return listKinds.includes(value);
}
function buildListResult(snapshot, kind) {
  return { schemaVersion: LIST_SCHEMA_VERSION, kind, items: validatedItems(snapshot, kind) };
}
function validatedItems(snapshot, kind) {
  switch (kind) {
    case "plans":
      return snapshot.plans.map((item) => PlanSchema.parse(item));
    case "patches":
      return snapshot.patches.map((item) => PatchSchema.parse(item));
    case "nodes":
      return snapshot.lanes.flatMap((lane) => lane.nodes).map((item) => NodeRecordSchema.parse(item));
    case "claims":
      return snapshot.claims.map((item) => ClaimSchema.parse(item));
    case "evidence":
      return snapshot.evidence.map((item) => EvidenceItemSchema.parse(item));
  }
}
function formatListLines(snapshot, kind) {
  switch (kind) {
    case "plans":
      return snapshot.plans.map(formatPlanLine);
    case "patches":
      return snapshot.patches.map(formatPatchLine);
    case "nodes":
      return snapshot.lanes.flatMap((lane) => lane.nodes.map((node) => formatNodeLine(node, lane.name)));
    case "claims":
      return snapshot.claims.map(formatClaimLine);
    case "evidence":
      return snapshot.evidence.map(formatEvidenceLine);
  }
}
function formatPlanLine(plan) {
  return [shortId(plan.id), plan.approved ? "adopted" : "pending", truncate(plan.title, 70)].join("  ");
}
function formatPatchLine(patch) {
  const blocking = patch.warnings.filter((warning) => warning.blocking).length;
  return [shortId(patch.id), patch.status, `${blocking} blocking`].join("  ");
}
function formatNodeLine(node, laneName) {
  return [shortId(node.id), truncate(laneName, 70), node.status, node.reproducibility].join("  ");
}
function formatClaimLine(claim) {
  return [shortId(claim.id), claim.type, claim.review, truncate(claim.text, 70)].join("  ");
}
function formatEvidenceLine(evidence) {
  return [shortId(evidence.id), `${evidence.review}/${evidence.validation}`, evidence.path ?? "(no path)"].join("  ");
}
function shortId(id) {
  return id.length > 8 ? id.slice(0, 8) : id;
}
function truncate(text, max) {
  const collapsed = text.replace(/\s+/g, " ").trim();
  return collapsed.length > max ? `${collapsed.slice(0, max - 1)}\u2026` : collapsed;
}

// src/index.ts
var program2 = new Command();
var providerChoices = ["openrouter", "openai", "anthropic", "customOpenAICompatible"];
var effortChoices = ["none", "low", "medium", "high"];
program2.name("nullius").description("Evidence-gated AI research workspace").version("0.1.0");
var initCommand = program2.command("init").description("Create a Nullius project manifest").argument("[folder]", "project folder", ".").option("--question <question>", "research question");
addModelOptions(initCommand).action(async (folder, options) => {
  const question = options.question ?? "";
  const manifest = ProjectManifestSchema.parse({
    schemaVersion: 1,
    name: question.trim() || "Untitled Nullius Project",
    question,
    roles: applyModelOptions(defaultRoles(), options),
    settings: {
      maxLanes: 3,
      depth: "standard",
      sandboxPolicy: "required",
      selfCorrectionRounds: 2
    },
    amendments: []
  });
  await createProject(folder, manifest);
  await recordCliActivity(folder, {
    role: "system",
    phase: "init.completed",
    title: "Project initialized",
    detail: manifest.question,
    command: "init"
  });
  process.stdout.write(`Created Nullius project at ${folder}
`);
});
program2.command("verify").description("Run deterministic gates").argument("[folder]", "project folder", ".").option("--json", "print JSON").option("--depth <depth>", "quick, standard, or deep").option("--gate <gate>", "numbers, citations, repro, or all", "all").action(async (folder, options) => {
  await withCliActivity(folder, "verify", "Verify gates", async () => {
    const snapshot = await loadProject(folder);
    const depth = options.depth ?? snapshot.manifest.settings.depth;
    const report = readinessReport(snapshotToGateProject(snapshot), depth, projectGateIO(folder));
    const gate = options.gate ?? "all";
    const gateStatus = verifyGateStatus(gate, report);
    const result = buildVerifyResult(gate, report);
    await recordCliActivity(folder, {
      source: "gate",
      role: "system",
      phase: "verify.result",
      title: gateStatus.ok ? "Gates passed" : "Gates not ready",
      detail: `${gate}; readiness=${Math.round(report.readinessScore * 100)}%; failures=${gateStatus.failures.join("; ") || "none"}`,
      severity: gateStatus.ok ? "ok" : "warning",
      command: "verify",
      exitCode: gateStatus.ok ? 0 : 1
    });
    process.stdout.write(options.json ? `${JSON.stringify(result, null, 2)}
` : `${gateStatus.ok ? "Ready" : "Not ready"} (${gate}; ${Math.round(report.readinessScore * 100)}%)
`);
    if (!gateStatus.ok) process.exitCode = 1;
  });
});
program2.command("run").description("Run one Full Auto pass").argument("[folder]", "project folder", ".").option("--lanes <count>", "number of lane passes to run").option("--depth <depth>", "quick, standard, or deep").option("--backend <backend>", "auto, pyodide, sandboxExec, or docker", "auto").option("--mock", "use deterministic local mock agents instead of configured models").option("--fabricated", "test mode: make the synthesizer fabricate a result").action(async (folder, options) => {
  await withCliActivity(folder, "run", "Full Auto run", async () => {
    const snapshot = await loadProject(folder);
    if (options.depth && snapshot.manifest.settings.depth !== options.depth) {
      snapshot.manifest.settings.depth = options.depth;
      await saveManifest(folder, snapshot.manifest);
    }
    const lanes = Math.max(1, Number(options.lanes ?? snapshot.manifest.settings.maxLanes ?? 1));
    let ready = false;
    let lastRunId = "";
    for (let index = 0; index < lanes; index += 1) {
      const result = await new FullAutoOrchestrator({ backend: executionBackendFor(options.backend ?? "auto") }).runOnce(
        folder,
        options.mock || options.fabricated ? new MockResearchAgents({ fabricated: Boolean(options.fabricated) }) : createResearchAgentsFromManifest(snapshot.manifest, { env: await envWithKeychain2() }),
        (event) => {
          process.stdout.write(`#${event.seq} ${event.role} ${event.kind}: ${event.title}
`);
          void appendActivityEvent(folder, activityFromFullAutoEvent(folder, event, { source: "cli", actor: "external-agent", command: "run" }));
        },
        {
          onStream: (event) => {
            void appendActivityEvent(folder, activityFromStreamEvent(folder, event, { source: "cli", actor: "external-agent", command: "run" }));
          }
        }
      );
      ready = result.ready;
      lastRunId = result.runId;
      if (ready) break;
    }
    await recordCliActivity(folder, {
      role: "system",
      phase: "run.result",
      title: ready ? "Full Auto completed" : "Full Auto completed: not ready",
      detail: `runId=${lastRunId}`,
      severity: ready ? "ok" : "warning",
      command: "run",
      exitCode: ready ? 0 : 1
    });
    process.stdout.write(`Run ${lastRunId} completed: ${ready ? "ready" : "not ready"}
`);
    if (!ready) process.exitCode = 1;
  });
});
program2.command("status").description("Print project readiness status").argument("[folder]", "project folder", ".").action(async (folder) => {
  const snapshot = await loadProject(folder);
  const report = readinessReport(snapshotToGateProject(snapshot), snapshot.manifest.settings.depth, projectGateIO(folder));
  process.stdout.write(`${report.ready ? "Ready" : "Not ready"} \xB7 ${Math.round(report.readinessScore * 100)}% \xB7 claims ${report.supportedClaims} \xB7 patches ${snapshot.patches.length}
`);
});
program2.command("list").description("List ids for plans, patches, nodes, claims, or evidence").argument("<kind>", `item kind: ${listKinds.join(", ")}`).argument("[folder]", "project folder", ".").option("--json", "print JSON").action(async (kind, folder, options) => {
  if (!isListKind(kind)) {
    process.stderr.write(`Unknown kind: ${kind}. Expected one of: ${listKinds.join(", ")}
`);
    process.exitCode = 2;
    return;
  }
  const snapshot = await loadProject(folder);
  if (options.json) {
    process.stdout.write(`${JSON.stringify(buildListResult(snapshot, kind), null, 2)}
`);
    return;
  }
  const lines = formatListLines(snapshot, kind);
  process.stdout.write(lines.length > 0 ? `${lines.join("\n")}
` : `No ${kind} found
`);
});
var modelsCommand = program2.command("models").description("Show or update planner/executor/reviewer provider and model settings").argument("[folder]", "project folder", ".");
addModelOptions(modelsCommand).action(async (folder, options) => {
  await withCliActivity(folder, "models", "Model settings", async () => {
    const snapshot = await loadProject(folder);
    const updatedRoles = applyModelOptions(snapshot.manifest.roles, options);
    if (hasModelOptions(options)) {
      await saveManifest(folder, { ...snapshot.manifest, roles: updatedRoles });
      await recordCliActivity(folder, {
        role: "system",
        phase: "models.updated",
        title: "Model settings updated",
        detail: `planner=${updatedRoles.planner.model}; executor=${updatedRoles.executor.model}; reviewer=${updatedRoles.reviewer.model}`,
        command: "models"
      });
      process.stdout.write(`Updated model settings in ${folder}/nullius.json
`);
    }
    printRoles(updatedRoles);
  });
});
program2.command("watch").description("Print recent transcript paths and current status").argument("[folder]", "project folder", ".").action(async (folder) => {
  const snapshot = await loadProject(folder);
  const report = readinessReport(snapshotToGateProject(snapshot), snapshot.manifest.settings.depth, projectGateIO(folder));
  process.stdout.write(`Mission Console
`);
  process.stdout.write(`Status: ${report.ready ? "Ready" : "Not ready"} (${Math.round(report.readinessScore * 100)}%)
`);
  process.stdout.write(`Transcripts: ${(0, import_node_path8.join)(folder, "runtime", "transcripts")}
`);
});
program2.command("approve").description("Approve and apply a staged manuscript patch").argument("<patchId>", "patch id").argument("[folder]", "project folder", ".").action(async (patchId, folder) => {
  await withCliActivity(folder, "approve", "Approve patch", async () => {
    const result = await approvePatch(folder, patchId);
    await recordCliActivity(folder, {
      source: "gate",
      role: "user",
      phase: "patch.approve.result",
      title: result.applied ? "Patch applied" : "Patch approval blocked",
      detail: result.applied ? patchId : result.reason ?? patchId,
      severity: result.applied ? "ok" : "warning",
      command: "approve",
      exitCode: result.applied ? 0 : 1
    });
    process.stdout.write(result.applied ? `Applied patch ${patchId}
` : `Patch ${patchId} not applied: ${result.reason ?? "blocked"}
`);
    if (!result.applied) process.exitCode = 1;
  });
});
program2.command("reject").description("Reject a staged manuscript patch").argument("<patchId>", "patch id").argument("[folder]", "project folder", ".").action(async (patchId, folder) => {
  await withCliActivity(folder, "reject", "Reject patch", async () => {
    await rejectPatch(folder, patchId);
    process.stdout.write(`Rejected patch ${patchId}
`);
  });
});
program2.command("steer").description("Save a steering instruction for the next run").argument("<instruction>", "instruction text").argument("[folder]", "project folder", ".").action(async (instruction, folder) => {
  await withCliActivity(folder, "steer", "Steering instruction", async () => {
    const runtime = (0, import_node_path8.join)(folder, "runtime");
    await (0, import_promises8.mkdir)(runtime, { recursive: true });
    await (0, import_promises8.writeFile)((0, import_node_path8.join)(runtime, "steering.txt"), `${instruction}
`, "utf8");
    await recordCliActivity(folder, {
      role: "user",
      phase: "steer.saved",
      title: "Steering instruction saved",
      detail: instruction,
      command: "steer"
    });
    process.stdout.write("Saved steering instruction\n");
  });
});
program2.command("export").description("Export manuscript").argument("<format>", "md or pdf").argument("[folder]", "project folder", ".").action(async (format, folder) => {
  await withCliActivity(folder, "export", `Export ${format}`, async () => {
    if (format !== "md" && format !== "pdf") {
      process.stderr.write("Only md is implemented; pdf requires a later Quarto/Pandoc integration.\n");
      process.exitCode = 2;
      return;
    }
    if (format === "pdf") {
      const out = (0, import_node_path8.join)(folder, "manuscript", "report.pdf");
      const exitCode = await runProcess2("quarto", ["render", (0, import_node_path8.join)(folder, "manuscript", "report.md"), "--to", "pdf", "--output", "report.pdf"], folder);
      if (exitCode !== 0) {
        process.stderr.write("PDF export requires Quarto/Pandoc and a valid LaTeX environment.\n");
        process.exitCode = exitCode || 2;
        return;
      }
      await (0, import_promises8.access)(out);
      process.stdout.write(`${out}
`);
      return;
    }
    const body = await exportMarkdown(folder);
    await recordCliActivity(folder, {
      role: "system",
      phase: "export.markdown.result",
      title: "Markdown exported",
      detail: `${body.length} characters`,
      command: "export"
    });
    process.stdout.write(body);
  });
});
program2.command("plan").description("Create a plan using configured planner").argument("[folder]", "project folder", ".").option("--mock", "use deterministic local mock planner").action(async (folder, options) => {
  await withCliActivity(folder, "plan", "Generate plan", async () => {
    const snapshot = await loadProject(folder);
    const plan = await (options.mock ? new MockResearchAgents() : createResearchAgentsFromManifest(snapshot.manifest, { env: await envWithKeychain2() })).createPlan(snapshot.manifest.question);
    await savePlan(folder, plan);
    await recordCliActivity(folder, {
      role: "planner",
      phase: "plan.generated",
      title: "Plan generated",
      detail: plan.title,
      command: "plan"
    });
    process.stdout.write(`${plan.id}	${plan.title}
`);
  });
});
program2.command("adopt").description("Approve a generated plan and lock the protocol if needed").argument("<planId>", "plan id").argument("[folder]", "project folder", ".").action(async (planId, folder) => {
  await withCliActivity(folder, "adopt", "Adopt plan", async () => {
    const snapshot = await loadProject(folder);
    const plan = snapshot.plans.find((candidate) => candidate.id === planId);
    if (!plan) {
      process.stderr.write(`Plan not found: ${planId}
`);
      process.exitCode = 1;
      return;
    }
    const adopted = { ...plan, approved: true };
    await savePlan(folder, adopted);
    if (!snapshot.manifest.protocolLock) {
      snapshot.manifest.protocolLock = {
        researchQuestion: snapshot.manifest.question,
        scope: adopted.purpose,
        plannedObservables: adopted.observables,
        successCriteria: adopted.successCriteria,
        falsificationCriteria: adopted.falsificationCriteria,
        requiredEvidence: ["approved evidence for every result claim"],
        exclusions: ["unsupported claims"],
        lockedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await saveManifest(folder, snapshot.manifest);
    }
    await recordCliActivity(folder, {
      role: "user",
      phase: "plan.adopted",
      title: "Plan adopted",
      detail: adopted.title,
      command: "adopt"
    });
    process.stdout.write(`Adopted plan ${planId}
`);
  });
});
var citations = program2.command("citations").description("Manage literature verification");
citations.command("verify").description("Verify project literature records").argument("[folder]", "project folder", ".").action(async (folder) => {
  await withCliActivity(folder, "citations.verify", "Verify citations", async () => {
    const snapshot = await loadProject(folder);
    const literature = await Promise.all(snapshot.literature.map((item) => verifyLiteratureItem(item)));
    await saveLiterature(folder, literature);
    const rejected2 = literature.filter((item) => item.status === "rejected" || item.status === "retracted").length;
    await recordCliActivity(folder, {
      source: "gate",
      role: "system",
      phase: "citations.verify.result",
      title: rejected2 > 0 ? "Citation verification found issues" : "Citations verified",
      detail: `${literature.length} literature item(s), ${rejected2} rejected/retracted`,
      severity: rejected2 > 0 ? "warning" : "ok",
      command: "citations.verify",
      exitCode: rejected2 > 0 ? 1 : 0
    });
    process.stdout.write(`${JSON.stringify({ ok: true, literature }, null, 2)}
`);
  });
});
citations.command("search").description("Search Crossref").argument("<query>", "bibliographic query").option("--rows <count>", "max rows", "5").action(async (query, options) => {
  const result = await searchCrossref2(query, Number(options.rows ?? 5));
  process.stdout.write(`${JSON.stringify({ ok: true, results: result }, null, 2)}
`);
});
program2.command("repro").description("Summarize reproducibility status").argument("[folder]", "project folder", ".").action(async (folder) => {
  await withCliActivity(folder, "repro", "Check reproducibility", async () => {
    const result = await checkProjectReproducibility(folder);
    await recordCliActivity(folder, {
      source: "sandbox",
      role: "system",
      phase: "repro.result",
      title: result.failed === 0 && result.divergent === 0 ? "Reproducibility check passed" : "Reproducibility check found issues",
      detail: `failed=${result.failed}; divergent=${result.divergent}`,
      severity: result.failed === 0 && result.divergent === 0 ? "ok" : "warning",
      command: "repro",
      exitCode: result.failed === 0 && result.divergent === 0 ? 0 : 1
    });
    process.stdout.write(`${JSON.stringify({ ok: result.failed === 0 && result.divergent === 0, ...result }, null, 2)}
`);
    if (result.failed > 0 || result.divergent > 0) process.exitCode = 1;
  });
});
program2.command("rerun").description("Rerun a generated node by id").argument("<nodeId>", "node id").argument("[folder]", "project folder", ".").action(async (nodeId, folder) => {
  await withCliActivity(folder, "rerun", "Rerun node", async () => {
    const result = await rerunNode(folder, nodeId);
    const ok = typeof result === "object" && result !== null && "ok" in result ? Boolean(result.ok) : false;
    await recordCliActivity(folder, {
      source: "sandbox",
      role: "executor",
      phase: "rerun.result",
      title: ok ? "Node rerun completed" : "Node rerun failed",
      detail: nodeId,
      severity: ok ? "ok" : "critical",
      command: "rerun",
      exitCode: ok ? 0 : 1
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}
`);
    if (!ok) process.exitCode = 1;
  });
});
program2.command("serve").description("Start the HTTP/WebSocket command server").option("--port <port>", "port, 0 for an ephemeral port", "0").action(async (options) => {
  const server = await startNulliusServer({ port: Number(options.port ?? 0) });
  process.stdout.write(`Nullius server listening on ${server.port}
`);
  const close = async () => {
    await server.close();
    process.exit(0);
  };
  process.on("SIGINT", close);
  process.on("SIGTERM", close);
});
var keys = program2.command("keys").description("Manage provider API keys");
keys.command("set").description("Store a provider API key in the macOS Keychain").argument("<provider>", "openrouter, openai, anthropic, or customOpenAICompatible").argument("<apiKey>", "API key").action(async (provider, apiKey) => {
  if (process.platform !== "darwin") {
    process.stderr.write("Keychain storage is currently implemented for macOS. Use environment variables on this platform.\n");
    process.exitCode = 2;
    return;
  }
  const exitCode = await runCapture2("security", ["add-generic-password", "-a", "nullius", "-s", keychainService2(provider), "-w", apiKey, "-U"]);
  if (exitCode.exitCode !== 0) {
    process.stderr.write(exitCode.stderr);
    process.exitCode = exitCode.exitCode;
    return;
  }
  process.stdout.write(`Stored key for ${provider}
`);
});
keys.command("env").description("Print expected environment variable names").action(() => {
  process.stdout.write([
    "OPENROUTER_API_KEY",
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY",
    "CUSTOM_OPENAI_API_KEY",
    "CUSTOM_OPENAI_BASE_URL"
  ].join("\n") + "\n");
});
program2.parse();
async function recordCliActivity(folder, input) {
  const { source, actor, ...rest } = input;
  await appendActivityEvent(folder, {
    ...rest,
    source: source ?? "cli",
    actor: actor ?? "external-agent"
  });
}
async function withCliActivity(folder, command, title, work) {
  await recordCliActivity(folder, {
    role: "system",
    phase: `${command}.started`,
    title,
    command
  });
  try {
    await work();
    const exitCode = numericExitCode();
    await recordCliActivity(folder, {
      role: "system",
      phase: `${command}.completed`,
      title: exitCode === 0 ? `${title} completed` : `${title} completed with issues`,
      severity: exitCode === 0 ? "ok" : "warning",
      command,
      exitCode
    });
  } catch (error) {
    await recordCliActivity(folder, {
      role: "system",
      phase: `${command}.failed`,
      title: `${title} failed`,
      detail: error instanceof Error ? error.message : String(error),
      severity: "critical",
      command,
      exitCode: 1
    });
    throw error;
  }
}
function numericExitCode() {
  if (typeof process.exitCode === "number") return process.exitCode;
  if (typeof process.exitCode === "string") {
    const parsed = Number(process.exitCode);
    return Number.isFinite(parsed) ? parsed : 1;
  }
  return 0;
}
function addModelOptions(command) {
  return command.option("--provider <provider>", "provider for all roles", (value) => parseChoice(value, providerChoices, "provider")).option("--model <model>", "model id for all roles").option("--reasoning-effort <effort>", "reasoning effort for all roles", (value) => parseChoice(value, effortChoices, "reasoning effort")).option("--planner-provider <provider>", "planner provider", (value) => parseChoice(value, providerChoices, "planner provider")).option("--planner-model <model>", "planner model id").option("--planner-effort <effort>", "planner reasoning effort", (value) => parseChoice(value, effortChoices, "planner effort")).option("--executor-provider <provider>", "executor provider", (value) => parseChoice(value, providerChoices, "executor provider")).option("--executor-model <model>", "executor model id").option("--executor-effort <effort>", "executor reasoning effort", (value) => parseChoice(value, effortChoices, "executor effort")).option("--reviewer-provider <provider>", "reviewer provider", (value) => parseChoice(value, providerChoices, "reviewer provider")).option("--reviewer-model <model>", "reviewer model id").option("--reviewer-effort <effort>", "reviewer reasoning effort", (value) => parseChoice(value, effortChoices, "reviewer effort"));
}
function parseChoice(value, choices, label) {
  if (choices.includes(value)) return value;
  throw new Error(`Invalid ${label}: ${value}. Expected one of: ${choices.join(", ")}`);
}
function defaultRoles() {
  return {
    planner: { provider: "openrouter", model: "openrouter/auto", reasoningEffort: "none" },
    executor: { provider: "openrouter", model: "openrouter/auto", reasoningEffort: "none" },
    reviewer: { provider: "openrouter", model: "openrouter/auto", reasoningEffort: "none" }
  };
}
function applyModelOptions(current, options) {
  const next = {
    planner: { ...current.planner },
    executor: { ...current.executor },
    reviewer: { ...current.reviewer }
  };
  for (const role of ["planner", "executor", "reviewer"]) {
    const override = roleOverrides(role, options);
    next[role] = {
      ...next[role],
      ...options.provider ? { provider: options.provider } : {},
      ...options.model ? { model: options.model } : {},
      ...options.reasoningEffort ? { reasoningEffort: options.reasoningEffort } : {},
      ...override.provider ? { provider: override.provider } : {},
      ...override.model ? { model: override.model } : {},
      ...override.reasoningEffort ? { reasoningEffort: override.reasoningEffort } : {}
    };
  }
  return ProjectManifestSchema.shape.roles.parse(next);
}
function roleOverrides(role, options) {
  const result = {};
  switch (role) {
    case "planner":
      if (options.plannerProvider) result.provider = options.plannerProvider;
      if (options.plannerModel) result.model = options.plannerModel;
      if (options.plannerEffort) result.reasoningEffort = options.plannerEffort;
      return result;
    case "executor":
      if (options.executorProvider) result.provider = options.executorProvider;
      if (options.executorModel) result.model = options.executorModel;
      if (options.executorEffort) result.reasoningEffort = options.executorEffort;
      return result;
    case "reviewer":
      if (options.reviewerProvider) result.provider = options.reviewerProvider;
      if (options.reviewerModel) result.model = options.reviewerModel;
      if (options.reviewerEffort) result.reasoningEffort = options.reviewerEffort;
      return result;
  }
}
function hasModelOptions(options) {
  return Boolean(
    options.provider || options.model || options.reasoningEffort || options.plannerProvider || options.plannerModel || options.plannerEffort || options.executorProvider || options.executorModel || options.executorEffort || options.reviewerProvider || options.reviewerModel || options.reviewerEffort
  );
}
function printRoles(roles) {
  for (const role of ["planner", "executor", "reviewer"]) {
    const config = roles[role];
    process.stdout.write(`${role}	${config.provider}	${config.model}	reasoning=${config.reasoningEffort}
`);
  }
}
function runProcess2(command, args, cwd) {
  return new Promise((resolve) => {
    const child = (0, import_node_child_process4.spawn)(command, args, { cwd, stdio: "inherit" });
    child.on("error", () => resolve(127));
    child.on("close", (code) => resolve(code ?? 1));
  });
}
async function envWithKeychain2() {
  const env = { ...process.env };
  if (process.platform !== "darwin") return env;
  for (const [provider, envName] of Object.entries(providerEnvNames2())) {
    if (env[envName]) continue;
    const result = await runCapture2("security", ["find-generic-password", "-a", "nullius", "-s", keychainService2(provider), "-w"]);
    if (result.exitCode === 0 && result.stdout.trim()) env[envName] = result.stdout.trim();
  }
  return env;
}
function providerEnvNames2() {
  return {
    openrouter: "OPENROUTER_API_KEY",
    openai: "OPENAI_API_KEY",
    anthropic: "ANTHROPIC_API_KEY",
    customOpenAICompatible: "CUSTOM_OPENAI_API_KEY"
  };
}
function keychainService2(provider) {
  return `nullius:${provider}`;
}
function runCapture2(command, args) {
  return new Promise((resolve) => {
    const child = (0, import_node_child_process4.spawn)(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", (error) => resolve({ exitCode: 127, stdout: Buffer.concat(stdout).toString("utf8"), stderr: String(error) }));
    child.on("close", (code) => resolve({ exitCode: code ?? 1, stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8") }));
  });
}
async function rerunNode(folder, nodeId) {
  const snapshot = await loadProject(folder);
  const lane = snapshot.lanes.find((candidate) => candidate.nodes.some((node2) => node2.id === nodeId));
  const node = lane?.nodes.find((candidate) => candidate.id === nodeId);
  if (!lane || !node) return { ok: false, reason: `Node not found: ${nodeId}` };
  const started = Date.now();
  const result = await defaultExecutionBackend().run(node.generatedCode, (0, import_node_path8.join)(folder, "lanes", lane.id, "nodes", node.id), { allowNetwork: false, timeoutSec: 30 });
  const updated = {
    ...node,
    status: result.status === "succeeded" ? "completed" : "error",
    reproducibility: result.status === "succeeded" ? "reproduced" : "failed",
    executionRecord: {
      exitCode: result.exitCode,
      startedAt: new Date(started).toISOString(),
      durationMs: Date.now() - started,
      backend: result.backend
    }
  };
  await saveNode(folder, lane.id, updated, [`# ${updated.title}`, "", `Status: ${updated.status}`, "", "```python", updated.generatedCode, "```", "", result.stdout || result.stderr].join("\n"));
  await saveLane(folder, { id: lane.id, name: lane.name, planId: lane.planId, nodeOrder: lane.nodeOrder.includes(updated.id) ? lane.nodeOrder : [...lane.nodeOrder, updated.id] });
  return { ok: true, node: updated, execution: result };
}
async function searchCrossref2(query, rows) {
  const response = await fetch(`https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(query)}&rows=${rows}`);
  if (!response.ok) return [];
  const body = await response.json();
  return (body.message?.items ?? []).map((item) => ({
    title: Array.isArray(item.title) ? item.title[0] : "",
    doi: typeof item.DOI === "string" ? item.DOI : void 0,
    url: typeof item.URL === "string" ? item.URL : void 0,
    year: String(readCrossrefYear2(item) ?? ""),
    citationKey: makeCitationKey2(item)
  }));
}
function readCrossrefYear2(item) {
  const issued = item.issued;
  return issued?.["date-parts"]?.[0]?.[0];
}
function makeCitationKey2(item) {
  const firstAuthor = Array.isArray(item.author) && typeof item.author[0] === "object" && item.author[0] && "family" in item.author[0] ? String(item.author[0].family) : "source";
  const year = readCrossrefYear2(item) ?? "nd";
  return `${firstAuthor.toLowerCase().replace(/[^a-z0-9]+/g, "")}${year}`;
}
