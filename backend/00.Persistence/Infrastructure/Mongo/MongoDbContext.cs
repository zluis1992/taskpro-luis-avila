using Domain.Entity;
using MongoDB.Driver;

namespace Infrastructure.Mongo;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(string connectionString, string databaseName)
    {
        var client = new MongoClient(connectionString);
        _database = client.GetDatabase(databaseName);
    }

    public IMongoCollection<Comment> Comments =>
        _database.GetCollection<Comment>("comments");
}
