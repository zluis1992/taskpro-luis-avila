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
        EnsureIndexes();
    }

    public IMongoCollection<Comment> Comments =>
        _database.GetCollection<Comment>("comments");

    private void EnsureIndexes()
    {
        var comments = _database.GetCollection<Comment>("comments");
        var indexKeys = Builders<Comment>.IndexKeys
            .Ascending(c => c.TaskId)
            .Descending(c => c.CreatedAt);
        var indexModel = new CreateIndexModel<Comment>(
            indexKeys,
            new CreateIndexOptions { Name = "taskId_createdAt" });
        comments.Indexes.CreateOne(indexModel);
    }
}
