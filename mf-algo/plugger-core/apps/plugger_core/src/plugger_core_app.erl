%%%-------------------------------------------------------------------
%% @doc plugger_core public API
%% @end
%%%-------------------------------------------------------------------

-module(plugger_core_app).

-behaviour(application).

%% Application callbacks
-export([start/2, stop/1]).

%%====================================================================
%% API
%%====================================================================

start(_StartType, _StartArgs) ->
    yellow_pages:start(),
    yellow_pages:create_service("hello_world", "mod1.js"),
    yellow_pages:create_service("hello_world", "mod2.js"),
    plugger_core_sup:start_link().

%%--------------------------------------------------------------------
stop(_State) ->
    yellow_pages:stop(),
    ok.

%%====================================================================
%% Internal functions
%%====================================================================
