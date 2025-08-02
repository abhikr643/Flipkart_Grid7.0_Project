import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
// <-- NEW: Import components from React Router -->
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useSearchParams
} from 'react-router-dom';



// --- ICONS (No changes here) ---
const ChevronUpIcon = ({ className = 'w-4 h-4' }) => ( <svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m18 15-6-6-6 6"></path></svg> );
const HistoryIcon = ({ className = 'w-6 h-6' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M12 8v4l2 2"></path></svg>);
const SearchIcon = ({ className = 'w-6 h-6' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const UserIcon = ({ className = 'w-6 h-6' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const ShoppingCartIcon = ({ className = 'w-6 h-6' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>);
const ChevronDownIcon = ({ className = 'w-4 h-4' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"></path></svg>);
const ChevronLeftIcon = ({ className = 'w-6 h-6' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6"></path></svg>);
const ChevronRightIcon = ({ className = 'w-6 h-6' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"></path></svg>);
const GridIcon = ({ className = 'w-6 h-6' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>);
const ListIcon = ({ className = 'w-6 h-6' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="8" x2="21" y1="6" y2="6"></line><line x1="8" x2="21" y1="12" y2="12"></line><line x1="8" x2="21" y1="18" y2="18"></line><line x1="3" x2="3.01" y1="6" y2="6"></line><line x1="3" x2="3.01" y1="12" y2="12"></line><line x1="3" x2="3.01" y1="18" y2="18"></line></svg>);

// --- MOCK DATA (No changes here) ---
const CATEGORIES_WITH_DROPDOWN = [{ name: 'Mobiles & Tablets', img: 'https://i.postimg.cc/yN2kMNzK/1header.webp' }, { name: 'Fashion', img: 'https://rukminim3.flixcart.com/www/128/128/promos/27/05/2024/9cd2872b-11ac-488d-ab4b-7d65d98b4c74.jpg?q=60', subcategories: ['Men\'s Top Wear', 'Women\'s Ethnic', 'Men\'s Footwear', 'Watches and Accessories'] }, { name: 'Electronics', img: 'https://rukminim3.flixcart.com/www/128/128/promos/09/07/2024/5f1413d6-e89d-497d-a060-7c4ad7742901.jpg?q=60', subcategories: ['Laptops', 'Cameras', 'Computer Peripherals', 'Gaming'] }, { name: 'Home & Furniture', img: 'https://rukminim3.flixcart.com/www/128/128/promos/09/07/2024/4ace4a0f-53b2-4f2a-b5bf-da65d7fe3263.jpg?q=60', subcategories: ['Living Room Furniture', 'Kitchen & Dining', 'Bedroom Furniture', 'Home Decor'] }, { name: 'Sports, health & Fitness', img: 'https://rukminim3.flixcart.com/www/128/128/promos/09/07/2024/a8ac02c8-0118-45b6-ab05-90a959f9e9dd.jpg?q=60' }, { name: 'Toys & Stationary', img: 'https://rukminim3.flixcart.com/www/128/128/promos/27/05/2024/1f402fea-8ce1-4c4c-80a3-a849448441bd.jpg?q=60' }, { name: 'Beauty, wellness and more..', img: 'https://rukminim3.flixcart.com/www/128/128/promos/09/07/2024/f13ffe75-154c-4162-866b-ffb6e54ee94c.jpg?q=60', subcategories: ['Beauty & Personal Care', 'Food & Drinks', 'Toys & School Supplies', 'Sports & Fitness'] }, { name: 'Footwear', img: 'https://rukminim3.flixcart.com/www/128/128/promos/27/05/2024/da193762-44de-4814-baf8-bfaf961e2430.jpg?q=60' },];
const CAROUSEL_IMAGES = [{ src: 'https://cdn.vectorstock.com/i/500p/21/38/beautiful-raksha-bandhan-sale-banner-with-golden-vector-46162138.jpg', alt: 'Big Billion Days Banner' }, { src: 'https://i.pinimg.com/1200x/8c/af/7e/8caf7e3933ac520999be3c1861d923bf.jpg', alt: 'Sale Banner' }, { src: 'https://rukminim2.flixcart.com/fk-p-flap/3240/540/image/10a4262bad1e9972.jpeg?q=60', alt: 'Fashion Sale Banner' }, { src: 'https://i.pinimg.com/1200x/c1/69/69/c16969a540f9a4c13eebc308a52493a2.jpg', alt: 'Home Decor Sale Banner' }, { src: 'https://i.postimg.cc/7ZczVyqJ/slide4-Edited-Edited.jpg', alt: 'New Sale Banner' },];
const DEALS = [{ id: 1, title: 'Top Selling Smartphones', img: 'https://i.pinimg.com/736x/48/fe/20/48fe20fc79b12c463e96c485518d9811.jpg', discount: 'From ₹7,999' }, { id: 2, title: 'Best Selling Laptops', img: 'https://i.pinimg.com/1200x/bc/d9/a4/bcd9a46ad15e22e9f7a8863dda2fc49d.jpg', discount: 'Min. 20% Off' }, { id: 3, title: 'Fashion For You', img: 'https://i.pinimg.com/736x/f4/3c/b4/f43cb4f7b74e88eac84a4b3f832fbc87.jpg', discount: '40-80% Off' }, { id: 4, title: 'TVs & Appliances', img: 'https://i.pinimg.com/736x/d8/da/ee/d8daeefd36210e3b87aba0e06a820fff.jpg', discount: 'Upto 60% Off' },];
const SEASON_SALE_PRODUCTS = [{ id: 5, name: 'Summer Dresses', img: 'https://i.pinimg.com/736x/77/8f/ad/778fadc6eea7a4d19212867111fe356d.jpg', price: 'Under ₹799' }, { id: 6, name: 'Men\'s Shorts', img: 'https://placehold.co/200x250/93c5fd/000000?text=Shorts', price: 'Min. 50% Off' }, { id: 7, name: 'Sunglasses', img: 'https://placehold.co/200x250/fca5a5/000000?text=Sunglasses', price: 'From ₹499' }, { id: 8, name: 'Flip-Flops', img: 'https://placehold.co/200x250/86efac/000000?text=Flip-Flops', price: 'Upto 60% Off' }, { id: 9, name: 'AC & Coolers', img: 'https://placehold.co/200x250/a5b4fc/000000?text=AC', price: 'Top Deals' },];
const WINTER_FRESH_PRODUCTS = [{ id: 10, name: 'Sweatshirts', img: 'https://placehold.co/200x250/60a5fa/ffffff?text=Sweatshirt', price: 'From ₹599' }, { id: 11, name: 'Jackets', img: 'https://placehold.co/200x250/34d399/ffffff?text=Jacket', price: 'Min. 40% Off' }, { id: 12, name: 'Mufflers & Scarves', img: 'https://placehold.co/200x250/f87171/ffffff?text=Muffler', price: 'Under ₹399' }, { id: 13, name: 'Heaters', img: 'https://placehold.co/200x250/fb923c/ffffff?text=Heater', price: 'Top Picks' }, { id: 14, name: 'Boots', img: 'https://placehold.co/200x250/c084fc/ffffff?text=Boots', price: 'From ₹999' },];
const ACCESSORIES = [{ id: 15, name: 'Smart Watches', img: 'https://placehold.co/200x250/1f2937/ffffff?text=Watch', price: 'From ₹1,299' }, { id: 16, name: 'Headphones', img: 'https://placehold.co/200x250/4f46e5/ffffff?text=Headphones', price: 'Upto 70% Off' }, { id: 17, name: 'Backpacks', img: 'https://placehold.co/200x250/047857/ffffff?text=Backpack', price: 'From ₹399' }, { id: 18, name: 'Power Banks', img: 'https://placehold.co/200x250/be123c/ffffff?text=Power+Bank', price: 'Just ₹699' }, { id: 19, name: 'Mobile Covers', img: 'https://placehold.co/200x250/fbbf24/000000?text=Cover', price: 'From ₹199' },];
const RECENTLY_VIEWED = [{ id: 2, title: 'Best Selling Laptops', img: 'https://placehold.co/300x400/1F2937/FFFFFF?text=Laptop', discount: 'Min. 20% Off' }, { id: 17, name: 'Backpacks', img: 'https://placehold.co/200x250/047857/ffffff?text=Backpack', price: 'From ₹399' }, { id: 7, name: 'Sunglasses', img: 'https://placehold.co/200x250/fca5a5/000000?text=Sunglasses', price: 'From ₹499' }, { id: 10, name: 'Sweatshirts', img: 'https://placehold.co/200x250/60a5fa/ffffff?text=Sweatshirt', price: 'From ₹599' },];

// --- UI COMPONENTS ---

const Header = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [trending, setTrending] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  // Sync search bar with URL
  useEffect(() => {
    const queryFromUrl = searchParams.get('q') || "";
    setQuery(queryFromUrl);
  }, [searchParams]);

  // Fetch autosuggestions when typing
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim() !== "" && isFocused) {
        axios.get(`http://localhost:8000/autosuggest?query=${encodeURIComponent(query)}`)
          .then(res => setSuggestions(res.data.suggestions || []));
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query, isFocused]);

  // Function to fetch history and trending data
  const fetchHistoryAndTrending = () => {
    axios.get(`http://localhost:8000/history`).then(res => setHistory(res.data.history || []));
    axios.get(`http://localhost:8000/trending`).then(res => setTrending(res.data.trending || []));
  };

  // This function now also saves the search to history
  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;
    setIsFocused(false);

    // Save to history via API call
    axios.post(`http://localhost:8000/history`, { term: searchTerm });

    // Navigate to results page
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Fetch history/trending only if the user hasn't typed anything yet
    if (query.trim() === "") {
      fetchHistoryAndTrending();
    }
  };

  return (
    <header className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex flex-col items-center">
                  <span className="text-white text-2xl font-bold italic">Flipkart</span>
                  <span className="text-white text-xs italic flex items-center">
                    Explore
                    <span className="text-yellow-400 ml-1">Plus</span>
                    <img
                      src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/plus_aef861.png"
                      alt="Plus"
                      className="h-2.5 ml-1"
                    />
                  </span>
                </Link>
        <div className="hidden sm:flex flex-grow max-w-xl mx-4 relative">
          <div className="flex items-center bg-white w-full rounded-lg shadow-inner">
            <SearchIcon className="w-5 h-5 text-blue-600 mx-3" />
            <input
              type="text"
              placeholder="Search for Products, Brands and More"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleFocus}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              onKeyDown={(e) => { if (e.key === 'Enter') { handleSearch(query); } }}
              className="w-full py-2 bg-transparent text-gray-800 focus:outline-none"
            />
          </div>

          {/* --- Conditional Dropdown Logic --- */}
          {isFocused && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg z-50">
              {/* Show Autosuggestions if user is typing */}
              {query.length > 0 && suggestions.length > 0 && (
                <ul>
                  {suggestions.map((s, idx) => (
                    <li key={idx} className="px-4 py-2 text-gray-800 hover:bg-blue-100 cursor-pointer text-sm flex items-center gap-3" onMouseDown={() => handleSearch(s.text)}>
                      <SearchIcon className="w-4 h-4 text-gray-500" />
                      <span>{s.text}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Show History/Trending if search bar is empty and focused */}
              {query.length === 0 && (
                <div>
                  <ul>
                    {history.map((h, idx) => (
                      <li key={`h_${idx}`} className="px-4 py-2 text-gray-800 hover:bg-blue-100 cursor-pointer text-sm flex items-center gap-3" onMouseDown={() => handleSearch(h)}>
                        <HistoryIcon className="w-4 h-4 text-gray-500" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  {history.length > 0 && <hr />}
                  <p className="px-4 pt-3 pb-1 text-gray-500 font-semibold text-sm">Trending</p>
                  <ul>
                    {trending.map((t, idx) => (
                      <li key={`t_${idx}`} className="px-4 py-2 text-gray-800 hover:bg-blue-100 cursor-pointer text-sm flex items-center gap-3" onMouseDown={() => handleSearch(t)}>
                        <SearchIcon className="w-4 h-4 text-gray-500" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-6">
          <button className="hidden md:flex items-center space-x-2">
            <UserIcon /> <span>Login</span> <ChevronDownIcon />
          </button>
          <button className="flex items-center space-x-2">
            <ShoppingCartIcon /> <span>Cart</span>
          </button>
        </div>
      </div>
    </header>
  );
};



// --- NEW COMPONENT FOR STAR RATING ---
const StarRating = ({ rating, totalStars = 5 }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full_${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
      ))}
      {halfStar && (
        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path><path d="M10 12.585l2.8 2.034c.784.57 1.838-.197 1.539-1.118l-1.07-3.292a1 1 0 00-.364-1.118l2.8-2.034c.783-.57.38-1.81-.588-1.81h-3.461a1 1 0 00-.951-.69l-1.07-3.292c-.3-.921-1.603-.921-1.902 0l-1.07 3.292a1 1 0 00-.95.69H3.498c-.969 0-1.371 1.24-.588 1.81l2.8 2.034a1 1 0 00-.364 1.118l-1.07 3.292c-.3.921.755 1.688 1.54 1.118l2.8-2.034a1 1 0 001.175 0z" clipRule="evenodd" fillOpacity="0.5"></path></svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty_${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
      ))}
      <span className="text-gray-600 text-sm ml-2">{rating.toFixed(1)}</span>
    </div>
  );
};

const ProductCard = ({ product, rating, view }) => {
    const seed = product?.id || Math.floor(Math.random() * 1000);
    const imageUrl = `https://picsum.photos/seed/${seed}/300/400`;

    if (view === 'grid') {
        return (
            <div className="border border-gray-200 rounded-lg overflow-hidden group bg-white hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="relative">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x400?text=Image+Not+Available'; }}
                        className="w-full h-48 object-cover"
                    />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
                    <h3 className="font-semibold text-gray-700 text-sm flex-grow h-10 overflow-hidden leading-tight">
                        {product.name}
                    </h3>
                    
                    {/* --- NEW: Dynamically display all attributes --- */}
                    <div className="mt-2 text-xs text-gray-600">
                        {product.attributes && Object.entries(product.attributes).map(([key, value]) => (
                            <p key={key} className="capitalize truncate">{key}: {value}</p>
                        ))}
                    </div>

                    <div className="mt-auto pt-2">
                        <StarRating rating={rating} />
                        <div className="flex items-center gap-2 mt-2">
                            <p className="text-lg font-bold text-gray-900">₹{product.base_price}</p>
                            <p className="text-sm text-gray-500 line-through">₹{product.original_price}</p>
                            <p className="text-sm font-bold text-green-600">{product.discount_percent}% off</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // List view
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden group flex flex-col sm:flex-row items-start space-x-4 p-4 bg-white hover:shadow-lg transition-shadow duration-300">
            <img
                src={imageUrl}
                alt={product.name}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x400?text=Image+Not+Available'; }}
                className="w-full sm:w-48 sm:h-48 object-cover flex-shrink-0 rounded-md"
            />
            <div className="flex-grow text-left mt-4 sm:mt-0">
                <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
                <div className="my-2 flex items-center gap-2">
                    <StarRating rating={rating} />
                </div>
                
                {/* --- NEW: Dynamically display all attributes as a list --- */}
                <ul className="text-sm text-gray-600 mt-2 list-disc list-inside space-y-1">
                    {product.attributes && Object.entries(product.attributes).map(([key, value]) => (
                        <li key={key}><span className="capitalize font-semibold">{key}:</span> {String(value)}</li>
                    ))}
                </ul>

                <div className="flex items-center gap-2 mt-4">
                    <p className="text-2xl font-bold text-gray-900">₹{product.base_price}</p>
                    <p className="text-md text-gray-500 line-through">₹{product.original_price}</p>
                    <p className="text-md font-bold text-green-600">{product.discount_percent}% off</p>
                </div>
                <p className="text-sm text-gray-600 mt-2">{product.delivery_info?.estimate_date ? `Get it by ${product.delivery_info.estimate_date}`: ''}</p>
            </div>
        </div>
    );
};

const PriceRangeFilter = ({ priceRange, onPriceChange }) => {
    const [value, setValue] = useState([priceRange.min, priceRange.max]);
    const overallMin = 0;
    const overallMax = 100000; // Default max value

    useEffect(() => {
        const handler = setTimeout(() => {
            if (value[0] !== priceRange.min || value[1] !== priceRange.max) {
                 onPriceChange({ min: value[0], max: value[1] });
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [value, onPriceChange, priceRange]);

    useEffect(() => {
        setValue([priceRange.min, priceRange.max]);
    }, [priceRange]);

    return (
        <div>
            <div className="px-2">
                <Slider
                    range
                    min={overallMin}
                    max={overallMax}
                    value={value}
                    onChange={setValue}
                    allowCross={false}
                    step={500}
                />
            </div>
            <div className="flex items-center justify-between gap-2 mt-2">
                {/* MODIFIED: The 'value' prop is now simplified to always show the current number */}
                <input 
                    type="number"
                    value={value[0]}
                    onChange={e => setValue([Number(e.target.value) || 0, value[1]])}
                    className="w-full p-2 border rounded-md text-sm"
                />
                <span className="text-gray-500">to</span>
                <input 
                    type="number"
                    value={value[1]}
                    onChange={e => setValue([value[0], Number(e.target.value) || overallMax])}
                    className="w-full p-2 border rounded-md text-sm"
                />
            </div>
        </div>
    );
};

const FilterSidebar = ({ availableFilters, selectedFilters, onFilterChange }) => {
    const [openSections, setOpenSections] = useState({
        "CUSTOMER RATINGS": true,
        "BRAND": true
    });
    const safeAvailableFilters = availableFilters || {};
    const toggleSection = (section) => setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    const handleCheckboxChange = (filterType, value) => {
        const currentSelection = selectedFilters[filterType] || [];
        const newSelection = currentSelection.includes(value)
            ? currentSelection.filter(item => item !== value)
            : [...currentSelection, value];
        onFilterChange(filterType, newSelection);
    };
    const handleRatingChange = (rating) => {
        const newRating = selectedFilters.rating === rating ? null : rating;
        onFilterChange('rating', newRating);
    };
    const handlePriceChange = (newPriceRange) => onFilterChange('price', newPriceRange);

    return (
        <div className="w-full lg:w-72 bg-white p-4 rounded-lg shadow-md flex-shrink-0">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-xl font-bold">Filters</h2>
                <button onClick={() => onFilterChange('clear', {})} className="text-sm text-blue-600 hover:underline">CLEAR ALL</button>
            </div>
            <div className="border-b pb-4 mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">PRICE</h3>
                <PriceRangeFilter priceRange={selectedFilters.price} onPriceChange={handlePriceChange} />
            </div>
            <div className="border-b pb-4 mb-4">
                <button onClick={() => toggleSection("CUSTOMER RATINGS")} className="w-full flex justify-between items-center font-semibold uppercase text-gray-700 mb-2">
                    CUSTOMER RATINGS {openSections["CUSTOMER RATINGS"] ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </button>
                {openSections["CUSTOMER RATINGS"] && (
                    <div className="space-y-2">
                        <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" className="h-4 w-4 rounded border-gray-300" checked={selectedFilters.rating === 4} onChange={() => handleRatingChange(4)} /><span className="text-gray-600">4★ & above</span></label>
                        <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" className="h-4 w-4 rounded border-gray-300" checked={selectedFilters.rating === 3} onChange={() => handleRatingChange(3)} /><span className="text-gray-600">3★ & above</span></label>
                    </div>
                )}
            </div>
            {Object.keys(safeAvailableFilters).map(filterType => (
                <div key={filterType} className="border-b pb-4 mb-4">
                    <button onClick={() => toggleSection(filterType)} className="w-full flex justify-between items-center font-semibold uppercase text-gray-700 mb-2">
                        {filterType.replace('_', ' ')} {openSections[filterType] ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </button>
                    {openSections[filterType] && (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {safeAvailableFilters[filterType].map(value => (
                                <label key={value} className="flex items-center space-x-3 cursor-pointer">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={(selectedFilters[filterType] || []).includes(value)} onChange={() => handleCheckboxChange(filterType, value)} />
                                    <span className="text-gray-600 capitalize">{value}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const BackToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            <ChevronUpIcon className="w-6 h-6" />
        </button>
    );
};
// --- PAGE COMPONENTS ---

// <-- NEW: Homepage component to hold all main page content -->
const HomePage = () => {
  return (
    <>
      <CategoryNav />
      <HeroCarousel />
      <DealsSection />
      <ProductRow title="Season Sale" products={SEASON_SALE_PRODUCTS} />
      <ProductRow title="Winter Fresh" products={WINTER_FRESH_PRODUCTS} />
      <ProductRow title="Top Accessories" products={ACCESSORIES} />
      <ProductRow title="Recently Visited" products={RECENTLY_VIEWED} />
    </>
  );
};

// <-- MODIFIED: SRP is now a self-contained page component -->
const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || "";
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [view, setView] = useState('list');
    const [sortOption, setSortOption] = useState('score');
    
    const [selectedFilters, setSelectedFilters] = useState({
        price: { min: 0, max: 100000 },
        rating: null
    });

    const initialPriceRange = useMemo(() => {
        // This is used to reset the price slider
        return { min: 0, max: 100000 };
    }, []);

    // --- MODIFIED: This is the main fix ---
    // This effect now sends a POST request whenever the query, filters, or sort option change.
    useEffect(() => {
        if (!query) return;
        setIsLoading(true);

        // Separate the dynamic filters (brand, color, etc.) from the main ones
        const { price, rating, ...otherFilters } = selectedFilters;
        
        const searchPayload = {
            query: query,
            filters: {
                price: price,
                rating: rating,
                ...otherFilters // Pass all other dynamic filters
            },
            sort_option: sortOption
        };

        // Change from GET to POST and send the full payload
        axios.post(`http://localhost:8000/search`, searchPayload)
            .then(res => {
                setResults(res.data || []);
            })
            .catch(err => console.error("Search API Error:", err))
            .finally(() => setIsLoading(false));
    // The effect now re-runs when filters or sorting change
    }, [query, selectedFilters, sortOption]); 


    const availableFilters = useMemo(() => {
        const filters = {};
        results.forEach(r => {
            if (r.product.brand && !filters.brand) filters.brand = new Set();
            if (r.product.brand) filters.brand.add(r.product.brand);
            
            if (r.product.category) {
              if (!filters.category) filters.category = new Set();
              filters.category.add(r.product.category);
            }
            
            if (r.product.attributes) {
                for (const [key, value] of Object.entries(r.product.attributes)) {
                    if (!filters[key]) filters[key] = new Set();
                    filters[key].add(value);
                }
            }
        });
        for (const key in filters) { filters[key] = Array.from(filters[key]).sort(); }
        return filters;
    }, [results]);

    const handleFilterChange = (filterType, value) => {
        if (filterType === 'clear') {
            setSelectedFilters({ price: initialPriceRange, rating: null });
        } else {
            setSelectedFilters(prev => ({ ...prev, [filterType]: value }));
        }
    };
    
    if (isLoading) return <div className="container mx-auto p-4 text-center">Loading...</div>;

    return (
        <div className="container mx-auto p-4 flex flex-col lg:flex-row items-start gap-6">
            <FilterSidebar availableFilters={availableFilters} selectedFilters={selectedFilters} onFilterChange={handleFilterChange} />
            <div className="flex-grow w-full">
                <div className="bg-white p-3 rounded-lg shadow-md mb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-bold text-gray-800"> Showing results for "{query}" </h1>
                        <p className="text-sm text-gray-500">{results.length} products found</p>
                    </div>
                    <div className="flex items-center gap-4">
                         <select value={sortOption} onChange={e => setSortOption(e.target.value)} className="p-2 border rounded-md bg-gray-100 text-gray-700">
                            <option value="score">Relevance</option>
                            <option value="popularity">Popularity</option>
                            <option value="price_asc">Price -- Low to High</option>
                            <option value="price_desc">Price -- High to Low</option>
                        </select>
                        <button onClick={() => setView('grid')} className={`p-2 rounded ${view === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}> <GridIcon /> </button>
                        <button onClick={() => setView('list')} className={`p-2 rounded ${view === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}> <ListIcon /> </button>
                    </div>
                </div>
                <div className={view === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-4"}>
                    {results.map(({ product, score, rating }) => (
                        <ProductCard key={product.id} product={product} score={score} rating={rating} view={view} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const Layout = ({ children }) => (
  <div className="bg-gray-100 min-h-screen font-sans">
    <Header />
    <main>{children}</main>
    <Footer />
    <BackToTopButton />
  </div>
);

// --- MAIN APP COMPONENT (MODIFIED for Routing) ---
export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResultsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}



// Unchanged components that can be collapsed for brevity in review
const CategoryNav = () => { return (<div className="bg-white shadow-sm border-b border-gray-200 relative z-40"> <div className="container mx-auto px-4"> <div className="flex justify-center items-center py-2 space-x-6 md:space-x-8"> {CATEGORIES_WITH_DROPDOWN.map(category => (<div key={category.name} className="relative group flex-shrink-0"> <div className="flex flex-col items-center justify-center w-24 text-center cursor-pointer"> <img src={category.img} alt={category.name} className="w-16 h-16 object-contain mb-1 transition-shadow duration-200 group-hover:shadow-md rounded-full" /> <div className="flex items-center justify-center"> <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600">{category.name}</span> {category.subcategories && <ChevronDownIcon className="w-3 h-3 ml-1 text-gray-600" />} </div> </div> {category.subcategories && (<div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50 hidden group-hover:block"> <ul className="py-2"> {category.subcategories.map(sub => (<li key={sub} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 cursor-pointer"> {sub} </li>))} </ul> </div>)} </div>))} </div> </div> </div>); };
const HeroCarousel = () => { const [currentIndex, setCurrentIndex] = useState(0); const nextSlide = () => { setCurrentIndex((prevIndex) => (prevIndex + 1) % CAROUSEL_IMAGES.length); }; const prevSlide = () => { setCurrentIndex((prevIndex) => (prevIndex - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length); }; useEffect(() => { const timer = setInterval(nextSlide, 5000); return () => clearInterval(timer); }, []); return (<div className="relative w-full container mx-auto my-4 overflow-hidden rounded-lg px-4"> <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}> {CAROUSEL_IMAGES.map((item, index) => (<div key={index} className="relative w-full flex-shrink-0"> <img src={item.src} alt={item.alt} className="w-full h-auto md:h-72 object-cover" onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/1600x400/cccccc/FFFFFF?text=Image+Not+Available`; }} /> </div>))} </div> <button onClick={prevSlide} className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow-md z-10"> <ChevronLeftIcon className="text-gray-800" /> </button> <button onClick={nextSlide} className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow-md z-10"> <ChevronRightIcon className="text-gray-800" /> </button> <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10"> {CAROUSEL_IMAGES.map((_, index) => (<div key={index} className={`w-3 h-3 rounded-full cursor-pointer ${currentIndex === index ? 'bg-white' : 'bg-white/50'}`} onClick={() => setCurrentIndex(index)}></div>))} </div> </div>); };
const DealsSection = () => { return (<div className="bg-white my-4"> <div className="container mx-auto p-4"> <h2 className="text-2xl font-bold text-gray-800 mb-4">Best Deals on Top Brands</h2> <div className="grid grid-cols-2 md:grid-cols-4 gap-4"> {DEALS.map(deal => (<div key={deal.id} className="border border-gray-200 rounded-lg overflow-hidden text-center cursor-pointer group"> <img src={deal.img} alt={deal.title} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" /> <div className="p-3"> <h3 className="font-semibold text-gray-700">{deal.title}</h3> <p className="text-green-600 font-bold mt-1">{deal.discount}</p> </div> </div>))} </div> </div> </div>); };
const ProductRow = ({ title, products }) => (<div className="bg-white my-4"> <div className="container mx-auto p-4"> <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2> <div className="flex space-x-4 overflow-x-auto pb-4"> {products.map(product => (<div key={product.id} className="border border-gray-200 rounded-lg p-2 text-center cursor-pointer group flex-shrink-0 w-48"> <img src={product.img || product.image_url} alt={product.name || product.title} className="w-full h-40 object-contain transition-transform duration-300 group-hover:scale-105" /> <div className="p-2"> <h3 className="font-semibold text-gray-700 truncate">{product.name || product.title}</h3> <p className="text-green-600 font-bold mt-1">{product.price || product.discount || `₹${product.base_price}`}</p> </div> </div>))} </div> </div> </div>);
const Footer = () => { return (<footer className="bg-gray-800 text-gray-400 mt-8"> <div className="container mx-auto p-8"> <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8"> {['ABOUT', 'HELP', 'POLICY', 'SOCIAL', 'Mail Us', 'Registered Office Address'].map(section => (<div key={section}> <h3 className="text-gray-500 uppercase text-sm font-bold mb-4">{section}</h3> <ul className="space-y-2 text-sm"> <li><a href="#" className="hover:text-white">Contact Us</a></li> <li><a href="#" className="hover:text-white">About Us</a></li> <li><a href="#" className="hover:text-white">Careers</a></li> <li><a href="#" className="hover:text-white">Flipkart Stories</a></li> </ul> </div>))} </div> <div className="mt-8 border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center text-sm"> <p>© 2007-{new Date().getFullYear()} Flipkart.com</p> <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/payment-method_69e7ec.svg" alt="Payment Methods" className="mt-4 md:mt-0" /> </div> </div> </footer>); };