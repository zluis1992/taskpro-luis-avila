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
        await _collection.Find(c => c.Id == id).FirstOrDefaultAsync();

    public async Task<IEnumerable<Domain.Entity.Comment>> GetByTaskAsync(int taskId) =>
        await _collection.Find(c => c.TaskId == taskId)
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
        await _collection.DeleteOneAsync(c => c.Id == id);
    }
}
