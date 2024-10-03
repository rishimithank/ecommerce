// Admin operations for managing items (CRUD, Pagination)
$(document).ready(function() {
    let currentPage = 1;

    function fetchItems(page) {
        $.ajax({
            url: `https://your-firebase-api/items?page=${page}`,
            type: 'GET',
            success: function(data) {
                $('#product-list-admin').html('');
                data.items.forEach(item => {
                    $('#product-list-admin').append(`
                        <div class="item">
                            <h3>${item.title}</h3>
                            <p>${item.description}</p>
                            <p>Price: $${item.price}</p>
                            <p>Qty: ${item.qty}</p>
                            <button class="edit-btn" data-id="${item.id}">Edit</button>
                            <button class="delete-btn" data-id="${item.id}">Delete</button>
                        </div>
                    `);
                });
            },
            error: function(error) {
                console.log('Error fetching items:', error);
            }
        });
    }

    // Pagination
    $('#next-page').click(function() {
        currentPage++;
        fetchItems(currentPage);
    });

    $('#prev-page').click(function() {
        if (currentPage > 1) {
            currentPage--;
            fetchItems(currentPage);
        }
    });

    fetchItems(currentPage);

    // Create Item
    $('#create-item-form').submit(function(e) {
        e.preventDefault();
        let item = {
            title: $('#title').val(),
            description: $('#description').val(),
            qty: $('#qty').val(),
            price: $('#price').val(),
            category: $('#category').val()
        };

        $.ajax({
            url: 'https://your-firebase-api/items',
            type: 'POST',
            data: JSON.stringify(item),
            contentType: 'application/json',
            success: function(response) {
                alert('Item created successfully!');
                fetchItems(currentPage); // Refresh the inventory
            },
            error: function(error) {
                console.log('Error creating item:', error);
            }
        });
    });

    // Delete Item
    $(document).on('click', '.delete-btn', function() {
        let itemId = $(this).data('id');
        let confirmDelete = confirm("Are you sure you want to delete this item?");

        if (confirmDelete) {
            $.ajax({
                url: `https://your-firebase-api/items/${itemId}`,
                type: 'DELETE',
                success: function() {
                    alert('Item deleted successfully');
                    fetchItems(currentPage);
                },
                error: function(error) {
                    console.log('Error deleting item:', error);
                }
            });
        }
    });
});
