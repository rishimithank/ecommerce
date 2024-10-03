// Fetch and display products for customers
$(document).ready(function() {
    function fetchItems() {
        $.ajax({
            url: 'https://your-firebase-api/items',
            type: 'GET',
            success: function(data) {
                $('#product-list').html('');
                data.items.forEach(item => {
                    $('#product-list').append(`
                        <div class="item">
                            <h3>${item.title}</h3>
                            <p>${item.description}</p>
                            <p>Price: $${item.price}</p>
                            <p>Qty: ${item.qty}</p>
                        </div>
                    `);
                });
            },
            error: function(error) {
                console.log('Error fetching items:', error);
            }
        });
    }

    fetchItems();
});
