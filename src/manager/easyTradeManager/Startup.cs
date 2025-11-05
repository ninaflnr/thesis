using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using easyTradeManager.Models;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

namespace easyTradeManager
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Get individual MySQL environment variables
            var host = Environment.GetEnvironmentVariable("MYSQL_HOST")
                ?? Environment.GetEnvironmentVariable("MYSQLHOST")
                ?? Configuration["MYSQL_HOST"]
                ?? Configuration["MYSQLHOST"]
                ?? "localhost";

            var port = Environment.GetEnvironmentVariable("MYSQL_PORT")
                ?? Environment.GetEnvironmentVariable("MYSQLPORT")
                ?? Configuration["MYSQL_PORT"]
                ?? Configuration["MYSQLPORT"]
                ?? "3306";

            var database = Environment.GetEnvironmentVariable("MYSQL_DATABASE")
                ?? Environment.GetEnvironmentVariable("MYSQLDATABASE")
                ?? Configuration["MYSQL_DATABASE"]
                ?? Configuration["MYSQLDATABASE"]
                ?? "easyTradeDB";

            var user = Environment.GetEnvironmentVariable("MYSQL_USER")
                ?? Environment.GetEnvironmentVariable("MYSQLUSER")
                ?? Configuration["MYSQL_USER"]
                ?? Configuration["MYSQLUSER"]
                ?? "root";

            var password = Environment.GetEnvironmentVariable("MYSQL_PASSWORD")
                ?? Environment.GetEnvironmentVariable("MYSQLPASSWORD")
                ?? Configuration["MYSQL_PASSWORD"]
                ?? Configuration["MYSQLPASSWORD"]
                ?? "";

            // Build connection string from individual MySQL environment variables
            // This is more reliable than using MSSQL_CONNECTIONSTRING which may contain unresolved placeholders
            var connectionString = $"Server={host};Port={port};Database={database};Uid={user};Pwd={password};";

            Console.WriteLine($"[Manager] Built connection string from environment variables:");
            Console.WriteLine($"[Manager]   Server={host}");
            Console.WriteLine($"[Manager]   Port={port}");
            Console.WriteLine($"[Manager]   Database={database}");
            Console.WriteLine($"[Manager]   User={user}");

            var serverVersion = ServerVersion.AutoDetect(connectionString);
            services.AddDbContext<AccountsDbContext>(options => options.UseMySql(connectionString, serverVersion));
            services.AddDbContext<PackagesDbContext>(options => options.UseMySql(connectionString, serverVersion));
            services.AddDbContext<ProductsDbContext>(options => options.UseMySql(connectionString, serverVersion));

            services.AddControllers().AddJsonOptions(o =>
            {
                o.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
                o.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
            });

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "easyTradeManager", Version = "v1" });
                c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
            });

            services.AddLogging(logOptions => {
                logOptions.ClearProviders();
                logOptions.AddSimpleConsole(consoleOptions => {
                    consoleOptions.TimestampFormat = "dd/MM/yy HH:mm:ss ";
                });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                ConfigureSwagger(app);
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }

        private void ConfigureSwagger(IApplicationBuilder app)
        {
            var proxyPrefix = Configuration["PROXY_PREFIX"];
            if (string.IsNullOrEmpty(proxyPrefix))
            {
                app.UseSwagger();
            }
            else
            {
                app.UseSwagger(opt =>
                {
                    opt.PreSerializeFilters.Add((swagger, httpReq) =>
                    {
                        var serverUrl = $"http://{httpReq.Host}/{proxyPrefix}";
                        swagger.Servers = new List<OpenApiServer> { new() { Url = serverUrl } };
                    });
                });
            }

            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("v1/swagger.json", "easyTradeManager v1");
            });
        }
    }
}
