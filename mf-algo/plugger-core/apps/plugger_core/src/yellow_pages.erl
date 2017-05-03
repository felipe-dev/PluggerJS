-module(yellow_pages).

-export([start/0, stop/0, stop/1, stop_service_by_pid/1, get_service_pid_by_key/1, create_service/2]).

start() ->
    ets:new(yellow_pages, [named_table, public]).

stop() ->
    stop(ets:first()).

stop('$end_of_table') -> done;
stop({ServiceKey, ServicePid, _ }) ->
    io:format("Stopping Service ~s ~n", [ServiceKey]),
    stop_service_by_pid(ServicePid),
    stop(ets:next()).

stop_service_by_pid(ServicePid) ->
    case ets:match(yellow_pages, {'$1', ServicePid}) of
        ServiceKey ->
            ets:delete(yellow_pages, list_to_binary(ServiceKey)),
            io:format("ServiceKey removed ~s ~n", [ServiceKey])
    end.

get_service_pid_by_key(ServiceKey) ->
    ServiceList = ets:lookup(yellow_pages, ServiceKey),
    case ServiceList of
        [] ->
            % Tratar erro quando nao tiver servico suportado
            {_Status, ServicePid} = service_session:start(),
            ets:insert(yellow_pages, {ServiceKey, ServicePid}),
            io:format("Creating new service ~s ~w ~n", [ServiceKey, ServicePid]),
            ServicePid;
        [{ServiceKey, ServicePid} ] ->
            % round robin quando tiver mais de um serviço
            io:format("Using existing service ~s ~w ~n", [ServiceKey, ServicePid]),
            ServicePid
    end.

create_service(ServiceKey, NodeModulePath) ->
    io:format("NodeModulePath: ~s ~n", [NodeModulePath]),
    {_Status, ServicePid} = service_session:start(NodeModulePath),
    ets:insert(yellow_pages, {ServiceKey, ServicePid, NodeModulePath}),
    io:format("Creating new service ~s ~w ~s ~n", [ServiceKey, ServicePid, NodeModulePath]),
    ServicePid.