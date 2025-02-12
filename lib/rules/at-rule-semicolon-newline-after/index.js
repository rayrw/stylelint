'use strict';

const hasBlock = require('../../utils/hasBlock');
const isStandardSyntaxAtRule = require('../../utils/isStandardSyntaxAtRule');
const nextNonCommentNode = require('../../utils/nextNonCommentNode');
const rawNodeString = require('../../utils/rawNodeString');
const report = require('../../utils/report');
const ruleMessages = require('../../utils/ruleMessages');
const validateOptions = require('../../utils/validateOptions');
const whitespaceChecker = require('../../utils/whitespaceChecker');

const ruleName = 'at-rule-semicolon-newline-after';

const messages = ruleMessages(ruleName, {
	expectedAfter: () => 'Expected newline after ";"',
});

const meta = {
	url: 'https://stylelint.io/user-guide/rules/at-rule-semicolon-newline-after',
	fixable: true,
	deprecated: true,
};

/** @type {import('stylelint').Rule} */
const rule = (primary, _secondary, context) => {
	const checker = whitespaceChecker('newline', primary, messages);

	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, {
			actual: primary,
			possible: ['always'],
		});

		if (!validOptions) {
			return;
		}

		root.walkAtRules((atRule) => {
			const nextNode = atRule.next();

			if (!nextNode) {
				return;
			}

			if (hasBlock(atRule)) {
				return;
			}

			if (!isStandardSyntaxAtRule(atRule)) {
				return;
			}

			// Allow an end-of-line comment
			const nodeToCheck = nextNonCommentNode(nextNode);

			if (!nodeToCheck) {
				return;
			}

			checker.afterOneOnly({
				source: rawNodeString(nodeToCheck),
				index: -1,
				err: (msg) => {
					if (context.fix) {
						nodeToCheck.raws.before = context.newline + nodeToCheck.raws.before;
					} else {
						report({
							message: msg,
							node: atRule,
							index: atRule.toString().length + 1,
							result,
							ruleName,
						});
					}
				},
			});
		});
	};
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;
module.exports = rule;
