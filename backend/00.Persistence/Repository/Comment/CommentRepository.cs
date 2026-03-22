using Domain.Entity;
using Domain.Interface;
using Infrastructure.Mongo;
using MongoDB.Driver;

namespace Repository.Comment;

public class CommentRepository : ICommentRepository
{
    private readonly IMongoCollection<Domain.Entity.Comment> _collection;

    public CommentRepository(MongoDbContext context)
    {
        _collection = context.Comments;
    }

    public async Task<Domain.Entity.Comment?> GetByIdAsync(string id) =>
        await _collection.Find(c => c.Id == id && !c.IsDeleted).FirstOrDefaultAsync();

    public async Task<IEnumerable<Domain.Entity.Comment>> GetByTaskAsync(int taskId) =>
        await _collection.Find(c => c.TaskId == taskId && !c.IsDeleted)
            .SortByDescending(c => c.CreatedAt)
            .ToListAsync();

    public async Task<Domain.Entity.Comment> AddAsync(Domain.Entity.Comment comment)
    {
        await _collection.InsertOneAsync(comment);
        return comment;
    }

    public async Task UpdateAsync(Domain.Entity.Comment comment)
    {
        var filter = Builders<Domain.Entity.Comment>.Filter.Eq(c => c.Id, comment.Id);
        await _collection.ReplaceOneAsync(filter, comment);
    }

    public async Task DeleteAsync(string id)
    {
        var filter = Builders<Domain.Entity.Comment>.Filter.Eq(c => c.Id, id);
        var update = Builders<Domain.Entity.Comment>.Update
            .Set(c => c.IsDeleted, true)
            .Set(c => c.DeletedAt, DateTime.UtcNow);
        await _collection.UpdateOneAsync(filter, update);
    }

    public async Task SoftDeleteByTaskAsync(int taskId)
    {
        var filter = Builders<Domain.Entity.Comment>.Filter.Eq(c => c.TaskId, taskId);
        var update = Builders<Domain.Entity.Comment>.Update
            .Set(c => c.IsDeleted, true)
            .Set(c => c.DeletedAt, DateTime.UtcNow);
        await _collection.UpdateManyAsync(filter, update);
    }
}
