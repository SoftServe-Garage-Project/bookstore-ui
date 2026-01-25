import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BookCard from './BookCard';
import { Book } from '../../services/bookService/bookService';

const mockBook: Book = {
  id: 1,
  title: 'Test Book',
  description: 'Test Description',
  genre: 'Fantasy',
  ageGroup: '12+',
  publishedYear: 2023,
  languageCode: 'en',
  authors: [{ firstName: 'John', lastName: 'Doe' }],
  price: 10.00,
  stockQuantity: 5,
  discountPercentage: 0,
  pageCount: 300,
  coverImageUrl: 'http://example.com/image.jpg'
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('BookCard Component', () => {
  it('відображає основну інформацію про книгу', () => {
    renderWithRouter(<BookCard book={mockBook} />);

    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('by John Doe')).toBeInTheDocument();
    expect(screen.getByText('Fantasy')).toBeInTheDocument();
    expect(screen.getByText('12+')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', mockBook.coverImageUrl);
  });

  it('відображає посилання на правильний ID книги', () => {
    renderWithRouter(<BookCard book={mockBook} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/book/1');
  });

  it('правильно розраховує та відображає ціну зі знижкою', () => {
    const bookWithDiscount = { ...mockBook, discountPercentage: 20, price: 100 };
    
    renderWithRouter(<BookCard book={bookWithDiscount} />);

    expect(screen.getByText('$120.00')).toHaveClass('oldPrice');
    expect(screen.getByText('$100.00')).toHaveClass('price');
  });

  it('відображає декількох авторів через кому', () => {
    const multiAuthorBook = {
      ...mockBook,
      authors: [
        { firstName: 'John', lastName: 'Doe' },
        { firstName: 'Jane', lastName: 'Smith' }
      ]
    };

    renderWithRouter(<BookCard book={multiAuthorBook} />);

    expect(screen.getByText('by John Doe, Jane Smith')).toBeInTheDocument();
  });

  it('відображає "No Cover", якщо coverImageUrl відсутній', () => {
    const noImageBook = { ...mockBook, coverImageUrl: null };
    
    renderWithRouter(<BookCard book={noImageBook} />);

    expect(screen.getByText('No Cover')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('відображає статус "Out of stock", якщо кількість 0', () => {
    const outOfStockBook = { ...mockBook, stockQuantity: 0 };
    
    renderWithRouter(<BookCard book={outOfStockBook} />);

    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('відображає кількість у наявності, якщо вона більша за 0', () => {
    renderWithRouter(<BookCard book={mockBook} />);

    expect(screen.getByText('5 in stock')).toBeInTheDocument();
  });
});