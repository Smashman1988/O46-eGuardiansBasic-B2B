// node tests/ballberater_config.cjs <php> <Twig autoloader> [PHP options]
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const vm = require('node:vm');
const fs = require('node:fs');

const template = fs.readFileSync('resources/views/StaticPages/Ballberater.twig', 'utf8');
const fragment = template.match(/<script>([\s\S]*?var configGlobal[\s\S]*?)<\/script>/)[1];
const settings = {label: "L'équipe", note: 'Zeile eins\nZeile zwei', title: 'Schuhe & Bälle'};
const render = String.raw`
require $argv[1];
[$template, $settings] = json_decode(stream_get_contents(STDIN), true);
$twig = new Twig\Environment(new Twig\Loader\ArrayLoader());
echo $twig->createTemplate($template)->render(['configAll' => $settings]);
`;
const code = execFileSync(process.argv[2], [...process.argv.slice(4), '-r', render, process.argv[3]],
    {input: JSON.stringify([fragment,settings]), encoding:'utf8'});
const context = {};
vm.runInNewContext(code, context);
assert.deepEqual(JSON.parse(JSON.stringify(context.configGlobal)), settings);
console.log('Ballberater retains configured text in the browser script.');

