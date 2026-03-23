FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY taskpro.sln .
COPY 01.Logic/Domain/Domain.csproj 01.Logic/Domain/
COPY 01.Logic/BusinessLogic/BusinessLogic.csproj 01.Logic/BusinessLogic/
COPY 00.Persistence/Infrastructure/Infrastructure.csproj 00.Persistence/Infrastructure/
COPY 00.Persistence/Repository/Repository.csproj 00.Persistence/Repository/
COPY 02.Service/API/API.csproj 02.Service/API/
COPY 03.Test/TaskPro.Tests/TaskPro.Tests.csproj 03.Test/TaskPro.Tests/

# Limpiar posibles archivos de configuración locales que interfieran en el build de Docker
RUN find . -name "*.user" -delete || true
RUN find . -name "obj" -type d -exec rm -rf {} + || true
RUN find . -name "bin" -type d -exec rm -rf {} + || true

RUN dotnet restore

# Copy source
COPY . .

# Build & publish
RUN dotnet publish 02.Service/API/API.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .
COPY version.json /version.json

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "API.dll"]
