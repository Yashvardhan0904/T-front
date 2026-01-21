export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    brand: string;
    description: string;
    image?: string;
    stock?: number;
}

export const products: Product[] = [
    {
        id: '1',
        name: 'Sony WH-1000XM5 Wireless Headphones',
        description: 'Industry-leading noise canceling with Auto NC Optimizer, 30-hour battery life.',
        price: 26900,
        category: 'Electronics',
        brand: 'Sony',
        stock: 25,
    },
    {
        id: '2',
        name: 'Apple MacBook Air M2',
        description: 'Supercharged by M2 chip. 13.6" Liquid Retina display, 8GB RAM, 256GB SSD.',
        price: 99900,
        category: 'Electronics',
        brand: 'Apple',
        stock: 15,
    },
    {
        id: '3',
        name: 'Nike Air Max 270',
        description: 'Nike Air Max 270 delivers superior comfort with React foam and Max Air unit.',
        price: 12900,
        category: 'Footwear',
        brand: 'Nike',
        stock: 50,
    },
    {
        id: '4',
        name: 'Samsung Galaxy S24 Ultra',
        description: 'AI-powered smartphone with 200MP camera, S Pen, and long-lasting battery.',
        price: 129999,
        category: 'Electronics',
        brand: 'Samsung',
        stock: 30,
    },
    {
        id: '5',
        name: "Levi's 511 Slim Fit Jeans",
        description: 'Modern slim-fit jeans with stretch denim for all-day comfort.',
        price: 2999,
        category: 'Clothing',
        brand: "Levi's",
        stock: 100,
    },
    {
        id: '6',
        name: 'Adidas Ultraboost Light',
        description: 'Lightest Ultraboost ever. Responsive BOOST middleware for endless energy.',
        price: 15999,
        category: 'Footwear',
        brand: 'Adidas',
        stock: 40,
    },
    {
        id: '7',
        name: 'Dyson V15 Detect Vacuum',
        description: 'Most powerful cordless vacuum. Laser reveals microscopic dust.',
        price: 55900,
        category: 'Home',
        brand: 'Dyson',
        stock: 10,
    },
];

export const categories = ['All', 'Electronics', 'Footwear', 'Clothing', 'Home'];
