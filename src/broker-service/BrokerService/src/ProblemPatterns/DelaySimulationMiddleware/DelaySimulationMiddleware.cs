using System.Runtime.CompilerServices;
using EasyTrade.BrokerService.Helpers;
using EasyTrade.BrokerService.ProblemPatterns.OpenFeature;

namespace EasyTrade.BrokerService.ProblemPatterns.DelaySimulation;

public class DelaySimulationMiddleware(
    IPluginManager pluginManager,
    IConfiguration config,
    ILogger<DelaySimulationMiddleware> logger
) : IMiddleware
{
    private readonly ILogger<DelaySimulationMiddleware> _logger = logger;
    private readonly IPluginManager _pluginManager = pluginManager;

    private readonly int _delayMs = int.TryParse(
        config[Constants.DelaySimulationRequestDelayMs],
        out var d
    )
        ? d
        : 4000;

   public async Task InvokeAsync(HttpContext context, RequestDelegate next)
   {
       try
       {
           var delayEnabled = await _pluginManager.GetPluginState(Constants.DelaySimulation, false);
           _logger.LogDebug("Feature flag state: {DelayEnabled}", delayEnabled);

           if (delayEnabled)
           {
               _logger.LogWarning("Delay simulation feature flag enabled! Adding delay of {DelayMs}ms.", _delayMs);
               await Task.Delay(_delayMs);
           }

           await next(context);
       }
       catch (Exception ex)
       {
           _logger.LogError(ex, "An error occurred in DelaySimulationMiddleware.");
           throw; // Re-throw to propagate the error
       }
   }
}
