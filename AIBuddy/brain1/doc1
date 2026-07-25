<h2>Quick Sort Implementation in Python</h2><p>Quick sort is a popular sorting algorithm that uses the divide-and-conquer technique to sort arrays of elements. Here's a comprehensive implementation of quick sort in Python:</p><h3>Code</h3><pre><code class="language-python">def quick_sort(arr):
    """
    Sorts an array using the quick sort algorithm.

    Args:
        arr (list): The list of elements to be sorted.

    Returns:
        list: The sorted list of elements.
    """
    if len(arr) &lt;= 1:
        # Base case: If the length of the array is 1 or less, return the array (since it's already sorted)
        return arr
    pivot = arr[len(arr) // 2]
    # Select a pivot element (in this case, the middle element)
    left = [x for x in arr if x &lt; pivot]
    # Create a list of elements less than the pivot
    middle = [x for x in arr if x == pivot]
    # Create a list of elements equal to the pivot
    right = [x for x in arr if x &gt; pivot]
    # Create a list of elements greater than the pivot
    return quick_sort(left) + middle + quick_sort(right)
    # Recursively sort the left and right lists and combine them with the middle list

# Example usage:
if __name__ == "__main__":
    arr = [5, 2, 9, 1, 7, 3]
    print("Original array:", arr)
    sorted_arr = quick_sort(arr)
    print("Sorted array:", sorted_arr)
</code></pre><h3>Explanation</h3><p>The provided code implements the quick sort algorithm in Python. Here's a step-by-step explanation:</p><ol><li><p><strong>Base case</strong>: If the length of the input array is 1 or less, the function returns the array as it's already sorted.</p></li><li><p><strong>Pivot selection</strong>: The middle element of the array is chosen as the pivot.</p></li><li><p><strong>List creation</strong>: Three lists are created:</p><ul><li><p><code>left</code>: Contains elements less than the pivot.</p></li><li><p><code>middle</code>: Contains elements equal to the pivot.</p></li><li><p><code>right</code>: Contains elements greater than the pivot.</p></li></ul></li><li><p><strong>Recursive sorting</strong>: The <code>quick_sort</code> function is called recursively on the <code>left</code> and <code>right</code> lists.</p></li><li><p><strong>Combination</strong>: The sorted <code>left</code>, <code>middle</code>, and <code>right</code> lists are combined to produce the final sorted array.</p></li></ol><h3>Time Complexity</h3><p>The average time complexity of quick sort is O(n log n), making it suitable for sorting large datasets. However, in the worst case (when the pivot is the smallest or largest element), the time complexity can be O(n^2).</p>