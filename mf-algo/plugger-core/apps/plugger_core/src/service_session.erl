-module(service_session).

-export([start/1, init/1]).

start(NodeModulePath) ->
    spawn(?MODULE, init, [NodeModulePath]).

init(NodeModulePath) ->
    register(complex, self()),
    process_flag(trap_exit, true),
    Port = open_port({spawn, string:concat("node ", NodeModulePath)}, [{packet, 2}]),
    Port.
