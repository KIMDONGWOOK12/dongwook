'use strict';
var __awaiter =
	(this && this.__awaiter) ||
	function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function (resolve) {
						resolve(value);
					});
		}
		return new (P || (P = Promise))(function (resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
			}
			step(
				(generator = generator.apply(thisArg, _arguments || [])).next(),
			);
		});
	};
var __generator =
	(this && this.__generator) ||
	function (thisArg, body) {
		var _ = {
				label: 0,
				sent: function () {
					if (t[0] & 1) throw t[1];
					return t[1];
				},
				trys: [],
				ops: [],
			},
			f,
			y,
			t,
			g = Object.create(
				(typeof Iterator === 'function' ? Iterator : Object).prototype,
			);
		return (
			(g.next = verb(0)),
			(g['throw'] = verb(1)),
			(g['return'] = verb(2)),
			typeof Symbol === 'function' &&
				(g[Symbol.iterator] = function () {
					return this;
				}),
			g
		);
		function verb(n) {
			return function (v) {
				return step([n, v]);
			};
		}
		function step(op) {
			if (f) throw new TypeError('Generator is already executing.');
			while ((g && ((g = 0), op[0] && (_ = 0)), _))
				try {
					if (
						((f = 1),
						y &&
							(t =
								op[0] & 2
									? y['return']
									: op[0]
										? y['throw'] ||
											((t = y['return']) && t.call(y), 0)
										: y.next) &&
							!(t = t.call(y, op[1])).done)
					)
						return t;
					if (((y = 0), t)) op = [op[0] & 2, t.value];
					switch (op[0]) {
						case 0:
						case 1:
							t = op;
							break;
						case 4:
							_.label++;
							return { value: op[1], done: false };
						case 5:
							_.label++;
							y = op[1];
							op = [0];
							continue;
						case 7:
							op = _.ops.pop();
							_.trys.pop();
							continue;
						default:
							if (
								!((t = _.trys),
								(t = t.length > 0 && t[t.length - 1])) &&
								(op[0] === 6 || op[0] === 2)
							) {
								_ = 0;
								continue;
							}
							if (
								op[0] === 3 &&
								(!t || (op[1] > t[0] && op[1] < t[3]))
							) {
								_.label = op[1];
								break;
							}
							if (op[0] === 6 && _.label < t[1]) {
								_.label = t[1];
								t = op;
								break;
							}
							if (t && _.label < t[2]) {
								_.label = t[2];
								_.ops.push(op);
								break;
							}
							if (t[2]) _.ops.pop();
							_.trys.pop();
							continue;
					}
					op = body.call(thisArg, _);
				} catch (e) {
					op = [6, e];
					y = 0;
				} finally {
					f = t = 0;
				}
			if (op[0] & 5) throw op[1];
			return { value: op[0] ? op[1] : void 0, done: true };
		}
	};
Object.defineProperty(exports, '__esModule', { value: true });
var child_process_1 = require('child_process');
var net = require('net');
var util_1 = require('util');
/**
 * Dev process:
 * 1. Update this file
 * 2. Run "npm run build:forwarder" to generate forwarder.js file
 * 3. Verify forwarder.js works with the extension
 * 4. Commit both forwarder.js and forwarder.ts into the repo
 */
var execAsync = (0, util_1.promisify)(child_process_1.exec);
function logInfo(message) {
	console.info('forwarder: '.concat(message));
}
function logError(message) {
	console.error('forwarder error: '.concat(message));
}
var Forwarder = /** @class */ (function () {
	function Forwarder() {}
	Forwarder.prototype.expectContainer = function (containerId, field, value) {
		return __awaiter(this, void 0, void 0, function () {
			var stdout, error_1;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						_a.trys.push([0, 2, , 3]);
						return [
							4 /*yield*/,
							execAsync(
								'docker inspect -f "{{'
									.concat(field, '}}" ')
									.concat(containerId),
							),
						];
					case 1:
						stdout = _a.sent().stdout;
						return [2 /*return*/, stdout.trim() === value];
					case 2:
						error_1 = _a.sent();
						logError(
							'Error getting container status: '.concat(
								error_1.message,
							),
						);
						return [2 /*return*/, false];
					case 3:
						return [2 /*return*/];
				}
			});
		});
	};
	Forwarder.prototype.monitorContainer = function (containerId) {
		return __awaiter(this, void 0, void 0, function () {
			var containerRunning, containerRestarting, containerCreating;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						if (!true) return [3 /*break*/, 5];
						return [
							4 /*yield*/,
							this.expectContainer(
								containerId,
								'.State.Running',
								'true',
							),
						];
					case 1:
						containerRunning = _a.sent();
						return [
							4 /*yield*/,
							this.expectContainer(
								containerId,
								'.State.Restarting',
								'true',
							),
						];
					case 2:
						containerRestarting = _a.sent();
						return [
							4 /*yield*/,
							this.expectContainer(
								containerId,
								'.State.Status',
								'created',
							),
						];
					case 3:
						containerCreating = _a.sent();
						if (
							!(containerCreating || containerRestarting) &&
							!containerRunning
						) {
							return [3 /*break*/, 5];
						}
						return [
							4 /*yield*/,
							new Promise(function (resolve) {
								return setTimeout(resolve, 10000);
							}),
						];
					case 4:
						_a.sent();
						return [3 /*break*/, 0];
					case 5:
						return [2 /*return*/];
				}
			});
		});
	};
	Forwarder.prototype.generateRemoteNodeJsCode = function (options) {
		if (
			(options.socket && options.port) ||
			(!options.socket && !options.port)
		) {
			throw new Error(
				'Invalid arguments, exactly one of socket or port must be provided.',
			);
		}
		var connectionOptions = options.port
			? "{ host: '127.0.0.1', port: ".concat(options.port, '}')
			: "{ path: '".concat(options.socket, "'}");
		if (options.port) {
			return "\nconst net = require('net');\nconst fs = require('fs');\nprocess.stdin.pause();\nconst client = net.createConnection(".concat(
				connectionOptions,
				", () => {\n\tconsole.error('Connection established');\n\tclient.pipe(process.stdout);\n\tprocess.stdin.pipe(client);\n});\nclient.on('close', function (hadError) {\n\tconsole.error(hadError ? 'Remote close with error' : 'Remote close');\n\tprocess.exit(hadError ? 1 : 0);\n});\nclient.on('error', function (err) {\n\tprocess.stderr.write(err && (err.stack || err.message) || String(err));\n});\nprocess.stdin.on('close', function (hadError) {\n\tconsole.error(hadError ? 'Remote stdin close with error' : 'Remote stdin close');\n\tprocess.exit(hadError ? 1 : 0);\n});\nprocess.on('uncaughtException', function (err) {\n\tfs.writeSync(process.stderr.fd, 'error: ' + (err.stack || err.message) + '\\n');\n\tprocess.exit(1);\n});",
			);
		} else if (options.socket) {
			return "\nconst net = require('net');\nconst fs = require('fs');\nprocess.stdin.pause();\nconst server = net.createServer(function (socket) {\n\tconsole.error('Connection established');\n\tsocket.pipe(process.stdout);\n\tprocess.stdin.pipe(socket);\n});\nserver.listen(".concat(
				connectionOptions,
				");\nserver.on('close', function (hadError) {\n\tconsole.error(hadError ? 'Remote close with error' : 'Remote close');\n\tprocess.exit(hadError ? 1 : 0);\n});\nserver.on('error', function (err) {\n\tprocess.stderr.write(err && (err.stack || err.message) || String(err));\n});\nprocess.stdin.on('close', function (hadError) {\n\tconsole.error(hadError ? 'Remote stdin close with error' : 'Remote stdin close');\n\tprocess.exit(hadError ? 1 : 0);\n});\nprocess.on('uncaughtException', function (err) {\n\tfs.writeSync(process.stderr.fd, 'error: ' + (err.stack || err.message) + '\\n');\n\tprocess.exit(1);\n});\n",
			);
		} else {
			throw new Error(
				'Invalid arguments, exactly one of socket or port must be provided.',
			);
		}
	};
	Forwarder.prototype.handleClient = function (_a) {
		return __awaiter(this, arguments, void 0, function (_b) {
			var nodeJsCode, nodeCommand, command, proc_1, error_2;
			var socket = _b.socket,
				containerId = _b.containerId,
				options = _b.options,
				remoteServerNodePath = _b.remoteServerNodePath,
				remoteUser = _b.remoteUser;
			return __generator(this, function (_c) {
				switch (_c.label) {
					case 0:
						_c.trys.push([0, 2, , 3]);
						nodeJsCode = this.generateRemoteNodeJsCode(options);
						nodeCommand = ''
							.concat(remoteServerNodePath, ' -e "')
							.concat(nodeJsCode, '"');
						command = [
							'docker',
							'exec',
							'-u',
							remoteUser,
							'-i',
							containerId,
							'bash',
							'-c',
							nodeCommand,
						];
						proc_1 = (0, child_process_1.spawn)(
							command[0],
							command.slice(1),
							{
								stdio: ['pipe', 'pipe', 'pipe'],
							},
						);
						// Wait briefly for potential immediate failures
						return [
							4 /*yield*/,
							new Promise(function (resolve) {
								return setTimeout(resolve, 500);
							}),
						];
					case 1:
						// Wait briefly for potential immediate failures
						_c.sent();
						if (proc_1.exitCode !== null) {
							logError(
								'handleClient Error: subprocess terminated immediately with return code '.concat(
									proc_1.exitCode,
								),
							);
							socket.end();
							return [2 /*return*/];
						}
						// Bidirectional forwarding
						if (proc_1.stdin && proc_1.stdout) {
							socket.pipe(proc_1.stdin);
							proc_1.stdout.pipe(socket);
						}
						// Handle cleanup
						socket.on('close', function () {
							proc_1.kill();
						});
						proc_1.on('error', function (error) {
							logError(
								'handleClient error: '.concat(error.message),
							);
							socket.end();
						});
						return [3 /*break*/, 3];
					case 2:
						error_2 = _c.sent();
						logError('handleClient Error: '.concat(error_2));
						socket.end();
						return [3 /*break*/, 3];
					case 3:
						return [2 /*return*/];
				}
			});
		});
	};
	Forwarder.prototype.startServer = function (
		containerId,
		port,
		remoteServerNodePath,
		remoteUser,
	) {
		return __awaiter(this, void 0, void 0, function () {
			var server;
			var _this = this;
			return __generator(this, function (_a) {
				server = net.createServer(function (socket) {
					_this.handleClient({
						socket: socket,
						containerId: containerId,
						options: { port: port },
						remoteServerNodePath: remoteServerNodePath,
						remoteUser: remoteUser,
					});
				});
				server.listen(0, '127.0.0.1', function () {
					var port = server.address().port;
					logInfo('====forwarderPort='.concat(port, '===='));
				});
				// Monitor container status
				this.monitorContainer(containerId).then(function () {
					server.close();
					logInfo('Stopping forwarding for port '.concat(port));
				});
				return [2 /*return*/];
			});
		});
	};
	Forwarder.prototype.startSocketForward = function (
		containerId,
		localSocket,
		remoteSocket,
		remoteServerNodePath,
		remoteUser,
	) {
		return __awaiter(this, void 0, void 0, function () {
			var localClient;
			return __generator(this, function (_a) {
				localClient = net.createConnection(localSocket);
				this.handleClient({
					socket: localClient,
					containerId: containerId,
					options: { socket: remoteSocket },
					remoteServerNodePath: remoteServerNodePath,
					remoteUser: remoteUser,
				});
				logInfo('====socketForward=success====');
				this.monitorContainer(containerId).then(function () {
					localClient.end();
					logInfo(
						'Stopping forwarding for socket '
							.concat(localSocket, ' to ')
							.concat(remoteSocket),
					);
				});
				return [2 /*return*/];
			});
		});
	};
	Forwarder.prototype.forwardPort = function (
		containerId,
		port,
		remoteServerNodePath,
		remoteUser,
	) {
		return __awaiter(this, void 0, void 0, function () {
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						return [
							4 /*yield*/,
							this.startServer(
								containerId,
								port,
								remoteServerNodePath,
								remoteUser,
							),
						];
					case 1:
						_a.sent();
						return [2 /*return*/];
				}
			});
		});
	};
	Forwarder.prototype.forwardSocket = function (
		containerId,
		localSocket,
		remoteSocket,
		remoteServerNodePath,
		remoteUser,
	) {
		return __awaiter(this, void 0, void 0, function () {
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						return [
							4 /*yield*/,
							this.startSocketForward(
								containerId,
								localSocket,
								remoteSocket,
								remoteServerNodePath,
								remoteUser,
							),
						];
					case 1:
						_a.sent();
						return [2 /*return*/];
				}
			});
		});
	};
	return Forwarder;
})();
function main() {
	return __awaiter(this, void 0, void 0, function () {
		var args,
			portOrSocket,
			containerId,
			remoteServerNodePath,
			remoteUser,
			port,
			error_3,
			localSocket,
			remoteSocket,
			error_4;
		return __generator(this, function (_a) {
			switch (_a.label) {
				case 0:
					args = process.argv.slice(2);
					if (args.length !== 5 && args.length !== 6) {
						logError(
							'Expected arguments: "port"|"socket" <container_id> <remote_server_node_path> <remoteUser> (<port> | <local_socket> <remote_socket>)',
						);
						process.exit(1);
					}
					portOrSocket = args[0];
					if (portOrSocket !== 'port' && portOrSocket !== 'socket') {
						logError(
							'Expected arguments: "port"|"socket" <container_id> <remote_server_node_path> <remoteUser> (<port> | <local_socket> <remote_socket>)',
						);
						process.exit(1);
					}
					containerId = args[1];
					remoteServerNodePath = args[2];
					remoteUser = args[3];
					if (!(portOrSocket === 'port')) return [3 /*break*/, 5];
					port = parseInt(args[4]);
					_a.label = 1;
				case 1:
					_a.trys.push([1, 3, , 4]);
					return [
						4 /*yield*/,
						new Forwarder().forwardPort(
							containerId,
							port,
							remoteServerNodePath,
							remoteUser,
						),
					];
				case 2:
					_a.sent();
					return [3 /*break*/, 4];
				case 3:
					error_3 = _a.sent();
					logError(String(error_3));
					process.exit(1);
					return [3 /*break*/, 4];
				case 4:
					return [3 /*break*/, 9];
				case 5:
					if (!(portOrSocket === 'socket')) return [3 /*break*/, 9];
					localSocket = args[4];
					remoteSocket = args[5];
					_a.label = 6;
				case 6:
					_a.trys.push([6, 8, , 9]);
					return [
						4 /*yield*/,
						new Forwarder().forwardSocket(
							containerId,
							localSocket,
							remoteSocket,
							remoteServerNodePath,
							remoteUser,
						),
					];
				case 7:
					_a.sent();
					return [3 /*break*/, 9];
				case 8:
					error_4 = _a.sent();
					logError(String(error_4));
					process.exit(1);
					return [3 /*break*/, 9];
				case 9:
					return [2 /*return*/];
			}
		});
	});
}
main().catch(function (error) {
	logError(String(error));
	process.exit(1);
});
