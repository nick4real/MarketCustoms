using System.Collections;

namespace WebStoreProduct.Application.Models;

public record PaginatedList<T> : IReadOnlyList<T>
{
    public T[] Items { get; }
    public int Count => Items.Length;

    public int PageIndex { get; }
    public int TotalPages { get; }
    public bool HasPreviousPage => PageIndex > 1;
    public bool HasNextPage => PageIndex < TotalPages;

    public PaginatedList(T[] items, int pageIndex, int totalPages)
    {
        Items = items;
        PageIndex = pageIndex;
        TotalPages = totalPages;
    }

    public T this[int index] => Items[index];
    public IEnumerator<T> GetEnumerator()
    {
        return new PaginatedListEnumerator<T>(Items);
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }
}

public class PaginatedListEnumerator<T> : IEnumerator<T>
{
    private readonly T[] _items;
    private int _position = -1;
    public PaginatedListEnumerator(T[] items)
    {
        _items = items;
    }
    public T Current => _items[_position];
    object IEnumerator.Current => Current;
    public bool MoveNext()
    {
        _position++;
        return (_position < _items.Length);
    }
    public void Reset()
    {
        _position = -1;
    }
    public void Dispose()
    {
        // No resources to dispose
    }
}