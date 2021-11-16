import arg from 'arg'
import inquirer from 'inquirer'
import { createProject } from './main'

function parseArgumentsIntoOptions (rawArgs) {
    const args = arg(
        {
            '--help': Boolean,
            '--git' : Boolean,
            '--yes': Boolean,
            '--install': Boolean,
            '-h': '--help',
            '-g': '--git',
            '-y': '--yes',
            '-i': '--install'
        },
        {
            argv: rawArgs.slice(2)
        }
    )
    return {
        help: args['--help'] || false,
        skipPrompts: args['--yes'] || false,
        git: args['--git'] || false,
        template: args._[0],
        runInstall: args['--install'] || false,
    }
}

async function promptForMissingOptions (options) {
    if (options.help) {
        const args = [
            `Templates: JavaScript, TypeScript`,
            `--help (-h): Duh. How'd you get here dummy?`,
            `--yes (-y): Skip prompts. Defaults to JavaScript template.`,
            `--git (-g): Initalizes a git repository`,
            `--install (-i): Install npm dependencies`
        ]
        console.log('\nThis automatically bootstraps a project based on provided templates.\n\n---ARGUMENTS---')
        args.forEach(command => console.log(command))
        console.log('\nExample: create-project TypeScript -g -i')
        process.exit(1)
    }
    
    const defaultTemplate = 'JavaScript'
    if (options.skipPrompts) {
        return {
            ...options,
            template: options.template || defaultTemplate
        }
    }

    const questions = []
    if (!options.template) {
        questions.push({
            type: 'list',
            name: 'template',
            message: 'Please choose which project template to use',
            choices: ['JavaScript', 'TypeScript'],
            default: defaultTemplate
        })
    }

    if (!options.git) {
        questions.push({
            type: 'confirm',
            name: 'git',
            message: 'Initialize a git repository?',
            default: false
        })
    }

    const answers = await inquirer.prompt(questions)
    return {
        ...options,
        template: options.template || answers.template,
        git: options.git || answers.git
    }
}

export async function cli (args) {
    let options = parseArgumentsIntoOptions(args)
    options = await promptForMissingOptions(options)
    await createProject(options)
}