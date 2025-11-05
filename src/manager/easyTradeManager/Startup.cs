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
            // Get connection string from configuration or build it from environment variables
            var connectionString = Configuration["MSSQL_CONNECTIONSTRING"];

            // If connection string contains placeholders like ${MYSQLPORT}, substitute them
            if (!string.IsNullOrEmpty(connectionString))
            {
                connectionString = connectionString
                    .Replace("${MYSQL_HOST}", Environment.GetEnvironmentVariable("MYSQL_HOST") ?? Configuration["MYSQL_HOST"] ?? "localhost")
                    .Replace("${MYSQLHOST}", Environment.GetEnvironmentVariable("MYSQLHOST") ?? Configuration["MYSQLHOST"] ?? "localhost")
                    .Replace("${MYSQL_PORT}", Environment.GetEnvironmentVariable("MYSQL_PORT") ?? Configuration["MYSQL_PORT"] ?? "3306")
                    .Replace("${MYSQLPORT}", Environment.GetEnvironmentVariable("MYSQLPORT") ?? Configuration["MYSQLPORT"] ?? "3306")
                    .Replace("${MYSQL_DATABASE}", Environment.GetEnvironmentVariable("MYSQL_DATABASE") ?? Configuration["MYSQL_DATABASE"] ?? "easyTradeDB")
                    .Replace("${MYSQLDATABASE}", Environment.GetEnvironmentVariable("MYSQLDATABASE") ?? Configuration["MYSQLDATABASE"] ?? "easyTradeDB")
                    .Replace("${MYSQL_USER}", Environment.GetEnvironmentVariable("MYSQL_USER") ?? Configuration["MYSQL_USER"] ?? "root")
                    .Replace("${MYSQLUSER}", Environment.GetEnvironmentVariable("MYSQLUSER") ?? Configuration["MYSQLUSER"] ?? "root")
                    .Replace("${MYSQL_PASSWORD}", Environment.GetEnvironmentVariable("MYSQL_PASSWORD") ?? Configuration["MYSQL_PASSWORD"] ?? "")
                    .Replace("${MYSQLPASSWORD}", Environment.GetEnvironmentVariable("MYSQLPASSWORD") ?? Configuration["MYSQLPASSWORD"] ?? "");
            }
            else
            {
                // Build connection string from individual environment variables if MSSQL_CONNECTIONSTRING is not set
                var host = Environment.GetEnvironmentVariable("MYSQL_HOST") ?? Environment.GetEnvironmentVariable("MYSQLHOST") ?? Configuration["MYSQL_HOST"] ?? "localhost";
                var port = Environment.GetEnvironmentVariable("MYSQL_PORT") ?? Environment.GetEnvironmentVariable("MYSQLPORT") ?? Configuration["MYSQL_PORT"] ?? "3306";
                var database = Environment.GetEnvironmentVariable("MYSQL_DATABASE") ?? Environment.GetEnvironmentVariable("MYSQLDATABASE") ?? Configuration["MYSQL_DATABASE"] ?? "easyTradeDB";
                var user = Environment.GetEnvironmentVariable("MYSQL_USER") ?? Environment.GetEnvironmentVariable("MYSQLUSER") ?? Configuration["MYSQL_USER"] ?? "root";
                var password = Environment.GetEnvironmentVariable("MYSQL_PASSWORD") ?? Environment.GetEnvironmentVariable("MYSQLPASSWORD") ?? Configuration["MYSQL_PASSWORD"] ?? "";

                connectionString = $"Server={host};Port={port};Database={database};Uid={user};Pwd={password};";
            }

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
