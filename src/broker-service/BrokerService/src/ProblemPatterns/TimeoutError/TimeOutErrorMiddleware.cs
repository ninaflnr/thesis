using System.Runtime.CompilerServices;
using EasyTrade.BrokerService.Helpers;
using EasyTrade.BrokerService.ProblemPatterns.OpenFeature;

namespace EasyTrade.BrokerService.ProblemPatterns.TimeoutError;

public class TimeoutErrorMiddleware(
    IPluginManager pluginManager,
    IConfiguration config,
    ILogger<TimeoutErrorMiddleware> logger
) : IMiddleware
{
    private readonly ILogger<TimeoutErrorMiddleware> _logger = logger;
    private readonly IPluginManager _pluginManager = pluginManager;

   public async Task InvokeAsync(HttpContext context, RequestDelegate next)
   {
       try
       {
           var timeoutEnabled = await _pluginManager.GetPluginState(Constants.TimeoutError, false);
           _logger.LogDebug("Feature flag state: {timeoutEnabled}", timeoutEnabled);

           if (timeoutEnabled)
           {
               _logger.LogWarning("Timeout simulation feature flag enabled!");
               context.Response.StatusCode = StatusCodes.Status504GatewayTimeout;
               await context.Response.WriteAsync("Simulated timeout error occurred.");
               return;
           }

           await next(context);
       }
       catch (Exception ex)
       {
           _logger.LogError(ex, "An error occurred in TimeoutErrorMiddleware.");
           throw; // Re-throw to propagate the error
       }
   }
}
