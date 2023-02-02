let eventBus = new Vue()

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
    <div class="product">
    
        <div class="product-image">
            <img v-bind:src="image" v-bind:alt="altText">
        </div>
        
        <div class="product-info">
            <h1>{{ title }}</h1>
            <p>{{ description }}</p>
            <span>{{ sale }}</span>
            <p v-if="inStock">In stock</p>
            <p v-else-if="inventory <= 10 && inventory > 0">Almost sold out!</p>
            <p v-else :class="{ outOfStock: !inStock }">Out of stock</p>
            
            <div class="color-box"
                 v-for="(variant, index) in variants"
                 :key="variant.variantId"
                 :style="{ backgroundColor:variant.variantColor }"
                 @mouseover="updateProduct(index)">
            </div>
            
            <ul>
                <li v-for="size in sizes">{{ size }}</li>
            </ul>
            
            <div>
                <button v-on:click="addToCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">Add</button>
                <button v-on:click="removeFromCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">Remove
                </button>
            </div>
            
            <a :href="link">More products like this</a>
        </div>
        
        <product-tabs :reviews="reviews" :shipping="shipping" :details="details"></product-tabs>
        
    </div>`,
    data() {
        return {
            product: "Socks",
            brand: "Vue Mastery",
            description: "A pair of warm, fuzzy socks.",
            selectedVariant: 0,
            altText: "A pair of socks",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            inventory: 14,
            onSale: true,
            reviews: [],
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10,
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 7,
                },
                {
                    variantId: 2236,
                    variantColor: 'white',
                    variantImage: "https://lonnamag.ru/upload/iblock/d3f/d3f271c842a2f044b7bcdea30fa1cfc2.png",
                    variantQuantity: 2,
                },
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        }
    },
    methods: {
        addToCart() {
            let cartItem = {
                product: this.product,
                variant: this.variants[this.selectedVariant].variantId,
                color: this.variants[this.selectedVariant].variantColor,
                onSale: this.onSale

            };
            this.$emit('add-to-cart', cartItem);
        },
        removeFromCart() {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
        },
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity;
        },
        sale() {
            if (this.onSale) return this.brand + ' ' + this.product + ' On Sale!';
            return this.brand + ' ' + this.product + ' Not on Sale';
        },
        shipping() {
            if (this.premium) {
                return 'Free';
            } else {
                return 2.99;
            }
        }
    },
});

Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">
        <p v-if="errors.length">
            <b>Please correct the following error(s):</b>
            <ul>
                <li v-for="error in errors">{{ error }}</li>
            </ul>
        </p>
        <p>
            <label for="name">Name:</label>
            <input id="name" v-model="name" placeholder="name">
        </p>
        <p>
            <label for="review">Review:</label>
            <textarea id="review" v-model="review"></textarea>
        </p>
        <p>
            <label for="rating">Rating:</label>
            <select id="rating" v-model.number="rating">
                <option>5</option>
                <option>4</option>
                <option>3</option>
                <option>2</option>
                <option>1</option>
            </select>
        </p>
        <p>Would you recommend this product?</p>
        <label>
          Yes
          <input type="radio" value="Yes" v-model="recommend"/>
        </label>
        <label>
          No
          <input type="radio" value="No" v-model="recommend"/>
        </label>
            
        <p>
          <input type="submit" value="Submit">  
        </p>    
    </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: [],
        }
    },
    methods: {
        onSubmit() {
            this.errors = []
            if (this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
            } else {
                if (!this.name) this.errors.push("Name required.")
                if (!this.review) this.errors.push("Review required.")
                if (!this.rating) this.errors.push("Rating required.")
                if (!this.recommend) this.errors.push("Recommend required.")
            }
        },
    }
});

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        },
        shipping: {
            required: true
        },
        details: {
            type: Array,
            required: true
        }
    },
    template: `
    <div> 
    
        <ul>
            <span class="tab"
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
            >{{ tab }}</span>
        </ul>
        
        <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul>
                <li v-for="review in reviews">
                    <p>{{ review.name }}</p>
                    <p>{{ review.review }}</p>
                    <p>Rating: {{ review.rating }}</p>
                    <p>{{ review.recommend }}</p>
                </li>
            </ul>
        </div>
        
        <div v-show="selectedTab === 'Make a Review'">
            <product-review></product-review>
        </div>
        
        <div v-show="selectedTab === 'Shipping'">
            <p>{{ shipping }}</p>
        </div>
            
        <div v-show="selectedTab === 'Details'">
            <ul>
                <li v-for="detail in details">{{ detail }}</li>
            </ul>
        </div>
        
    </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews',
        }
    },
})

Vue.component('cart-detail', {
    props: {
        goods: {
            type: Array,
            required: false
        },
        materials: {
            type: Array,
            required: false
        }
    },
    template: `
    <div>
        <div v-show="cartVisibility" class="cart-detail">
            <table v-if="goods.length">
                <thead>
                    <tr>
                        <th>№</th>
                        <th>Item</th>
                        <th>Details</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(good, index) in goods">
                    <div class="cart-buttons">
                        <a href="#">+</a>
                        <a href="#">-</a>
                    </div>    
                        <td>{{ index + 1 }}</td>
                        <td>{{ good.product }}</td>
                        <td>{{ good.color }}</td>
                    </tr>
                </tbody>
            </table>
            <p v-else>Your cart empty</p>
        </div>
        <button @click="showCart">Show cart</button>
    </div>`,

    data() {
        return {
            cartVisibility: false,
        }
    },
    methods: {
        showCart() {
            this.cartVisibility = !this.cartVisibility;
        },
    }
})

let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
    },
    methods: {
        addProductToCart(id) {
            this.cart.push(id);
        },
        removeProductFromCart(id) {
            this.cart.pop(id);
        }
    }
});