import {red} from 'chalk';
import {Command} from 'commander';
import {Lib as WorkspaceaddonscriptsModule} from '../lib/index';
import {BuildCommand} from './commands/build.command';
import {PushCommand} from './commands/push.command';

export class Cli {
  private workspaceaddonscriptsModule: WorkspaceaddonscriptsModule;
  buildCommand: BuildCommand;
  pushCommand: PushCommand;

  commander = [
    'seminjecto-workspace-scripts',
    'Scripts for Google Workspace addons.',
  ];

  buildCommandDef: CommandDef = ['build', 'Build distribution package.'];

  pushCommandDef: CommandDef = [
    'push',
    'Push to the Apps Script server.',
    ['--copy [value]', 'Copied resources, comma-seperated.'],
    ['--vendor [value]', 'Files for @vendor.js, comma-seperated.'],
  ];

  constructor() {
    this.workspaceaddonscriptsModule = new WorkspaceaddonscriptsModule();
    this.buildCommand = new BuildCommand(
      this.workspaceaddonscriptsModule.optionService,
      this.workspaceaddonscriptsModule.messageService,
      this.workspaceaddonscriptsModule.rollupService
    );
    this.pushCommand = new PushCommand(
      this.workspaceaddonscriptsModule.optionService,
      this.workspaceaddonscriptsModule.messageService,
      this.workspaceaddonscriptsModule.fileService
    );
  }

  getApp() {
    const commander = new Command();

    // general
    const [command, description] = this.commander;
    commander
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      .version(require('../../package.json').version, '-v, --version')
      .name(`${command}`)
      .usage('[options] [command]')
      .description(description);

    // build
    (() => {
      const [command, description] = this.buildCommandDef;
      commander
        .command(command)
        .description(description)
        .action(() => this.buildCommand.run());
    })();

    // push
    (() => {
      const [command, description, copyOpt, vendorOpt] = this.pushCommandDef;
      commander
        .command(command)
        .description(description)
        .option(...copyOpt) // --copy
        .option(...vendorOpt) // --vendor
        .action(options => this.pushCommand.run(options));
    })();

    // help
    commander
      .command('help')
      .description('Display help.')
      .action(() => commander.outputHelp());

    // *
    commander
      .command('*')
      .description('Any other command is not supported.')
      .action(cmd => console.error(red(`Unknown command '${cmd.args[0]}'`)));

    return commander;
  }
}

type CommandDef = [string, string, ...Array<[string, string]>];
