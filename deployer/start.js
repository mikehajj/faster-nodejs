"use strict";

const fs = require( "fs" );
const { spawn } = require( "child_process" );

class MSDeployer {
	
	main_node_command = `${ process.env.MS_NODE_BIN } `;
	main_npm_command = `${ process.env.MS_NPM_BIN } `;
	main_git_command = `${ process.env.MS_GIT_BIN } `;
	main_launch_command = null;
	
	service_path = "";
	memory_limit = null;
	log_path = "";
	git_info = {};
	
	/**
	 * Class Constructor, checks the env vars and assigns them to properties
	 */
	constructor() {
		
		//check if GIT_REPO is provided
		if ( !process.env.MS_GIT_REPO || process.env.MS_GIT_REPO.trim() === '' ) {
			let errString = `Error: Unable to proceed!\n\n` +
				`Expecting an environment variable 'GIT_REPO' to be provided.\n` +
				`Please check README.md file for further instructions.`;
			throw new Error( errString );
		}
		
		//check if GIT_USERNAME is provided
		if ( !process.env.MS_GIT_USERNAME || process.env.MS_GIT_USERNAME.trim() === '' ) {
			let errString = `Error: Unable to proceed!\n\n` +
				`Expecting an environment variable 'GIT_USERNAME' to be provided.\n` +
				`Please check README.md file for further instructions.`;
			throw new Error( errString );
		}
		
		//check if GIT_PASSWORD is provided
		if ( !process.env.MS_GIT_PASSWORD || process.env.MS_GIT_PASSWORD.trim() === '' ) {
			let errString = `Error: Unable to proceed!\n\n` +
				`Expecting an environment variable 'GIT_PASSWORD' to be provided.\n` +
				`Please check README.md file for further instructions.`;
			throw new Error( errString );
		}
		
		this.git_info.username = process.env.MS_GIT_USERNAME;
		this.git_info.password = fs.readFileSync(process.env.MS_GIT_PASSWORD, {'encoding': 'utf8'});
		this.git_info.repo = process.env.MS_GIT_REPO;
		
		if ( process.env.MS_GIT_BRANCH && process.env.MS_GIT_BRANCH.trim() !== '' ) {
			this.git_info.branch = process.env.MS_GIT_BRANCH;
			console.log( `-> Custom git branch detected, setting git branch to ${ this.git_info.branch } ...` );
		}
		
		//ensure/set service path if not provided
		if ( process.env.MS_SERVICE_PATH && process.env.MS_SERVICE_PATH.trim() !== '' ) {
			this.service_path = process.env.MS_SERVICE_PATH;
			console.log( `-> Custom service path detected, setting service path to ${ this.service_path } ...` );
		}
		
		if ( process.env.MS_MEMORY_LIMIT && process.env.MS_MEMORY_LIMIT !== 0 ) {
			console.log( `-> Memory limit detected, setting --max_old_space_size=${ process.env.MS_MEMORY_LIMIT } ...` );
			this.memory_limit = process.env.MS_MEMORY_LIMIT;
		}
		
		if ( process.env.MS_LAUNCH_CMD && process.env.MS_LAUNCH_CMD.trim() !== '' ) {
			this.main_launch_command = process.env.MS_LAUNCH_CMD;
		}
		
		this.log_path = `/opt/logs/${ process.env.MS_GIT_REPO }--service.log`;
		console.log( `-> Setting custom log path to /opt/logs/${ process.env.MS_GIT_REPO }--service.log ...` );
	}
	
	/**
	 * Generic nodejs child spawn process executer.
	 * @param context {Object}
	 * @param callback {Function}
	 */
	child_executer( context, callback ) {
		context.cmd_options.shell = true;
		context.cmd_options.env = process.env;
		context.cmd_options.stdio = [ 'pipe', process.stdout, process.stderr ];
		const child_spawner = spawn( context.main_cmd, context.cmd_params, context.cmd_options );
		
		child_spawner.on( 'error', ( error ) => {
			return callback( error );
		} );
		
		child_spawner.on( 'close', ( code ) => {
			if ( code === 0 ) {
				if ( context.notification ) {
					console.log( '-> ' + context.notification.success );
				}
				return callback( null, true );
			}
			else {
				if ( context.notification ) {
					return callback( new Error( context.notification.error ) );
				}
				else {
					return callback( true );
				}
			}
			
		} );
	}
	
	/**
	 * clones the code of the microservice from a git repo
	 * @param callback {Function}
	 */
	clone( callback ) {
		console.log( "-> Cloning Source Code from Github ..." );
		let clone_arguments = [ 'clone' ];
		clone_arguments.push( `https://${ this.git_info.password }@github.com/${ this.git_info.username }/${ this.git_info.repo }.git` );
		
		if ( this.git_info.branch ) {
			clone_arguments.push( "--branch" );
			clone_arguments.push( this.git_info.branch );
		}
		
		this.child_executer( {
			                     'main_cmd': this.main_git_command,
			                     'cmd_params': clone_arguments,
			                     'cmd_options': { cwd: '/opt/' },
			                     'notification': {
				                     'success': 'Source Code cloned successfully from Github Repository ...',
				                     'error': 'Error cloning source code from Github Repository. Unable to proceed!'
			                     }
		                     }, callback );
	}
	
	/**
	 * installs the dependencies of the microservice
	 * @param callback {Function}
	 */
	install( callback ) {
		console.log( "-> Installing Dependencies ..." );
		this.child_executer( {
			                     'main_cmd': this.main_npm_command,
			                     'cmd_params': [ 'install' ],
			                     'cmd_options': { cwd: `/opt/${ this.git_info.repo }/` },
			                     'notification': {
				                     'success': 'Dependencies installed successfully ...',
				                     'error': 'Error installing dependencies. Unable to proceed!'
			                     }
		                     }, callback );
	}
	
	/**
	 * creates a new child process that launches the microservice
	 * @param callback {Function}
	 */
	launch( callback ) {
		console.log( "-> Launching Microservice ..." );
		
		let launch_arguments = [];
		let launch_command = this.main_node_command;
		if ( !this.main_launch_command ) {
			//check and set memory limit if supplied
			if ( this.memory_limit ) {
				launch_arguments.push( `--max_old_space_size=${ this.memory_limit }` );
			}
			launch_arguments.push( `.` );
			launch_arguments.push( `2>&1 | tee ${ this.log_path }` );
		}
		else {
			launch_command = this.main_launch_command;
			
			//if case like npm start, npm is the command and start becomes and argument
			if ( this.main_launch_command.includes( " " ) ) {
				this.main_launch_command = this.main_launch_command.split( " " );
				launch_command = this.main_launch_command[ 0 ];
				this.main_launch_command.shift();
				launch_arguments = this.main_launch_command;
			}
		}
		
		this.child_executer( {
			                     'main_cmd': launch_command,
			                     'cmd_params': launch_arguments,
			                     'cmd_options': { cwd: `/opt/${ this.git_info.repo }${ this.service_path }` },
		                     }, callback );
	}
}

const msDeployer = new MSDeployer();

//clone microservice source code
msDeployer.clone( ( error ) => {
	if ( error ) {
		console.log( error );
		process.exit( -1 );
	}

// 	//install microservice dependencies
	msDeployer.install( ( error ) => {
		if ( error ) {
			console.log( error );
			process.exit( -1 );
		}

		//start the microservice
		msDeployer.launch( ( error ) => {
			if ( error ) {
				console.log( error );
				process.exit( -1 );
			}

		} );

	} );

} );