import mongoose from 'mongoose';
import { User, Genre, Movie, Cinema, Screen, Show, Booking, Payment } from '../models/index.js';
import { SEAT_CATEGORIES, SEAT_STATUS } from '../constants/seatStatus.js';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../constants/bookingStatus.js';
import { logger } from '../utils/logger.js';

export const seedDatabase = async () => {
  logger.info('Starting full CineVerse database seeding...');

  // Clear existing collections and stale indexes
  await Promise.all([
    User.deleteMany({}),
    Genre.deleteMany({}),
    Movie.deleteMany({}),
    Cinema.deleteMany({}),
    Screen.deleteMany({}),
    Show.deleteMany({}),
    Booking.deleteMany({}),
    Payment.deleteMany({}),
  ]);

  // Drop any legacy indexes that violate multikey constraints
  await Movie.collection.dropIndexes().catch(() => {});

  // 1. Seed Users
  logger.info('Seeding users (Admin & Demo Customer)...');
  const adminUser = await User.create({
    name: 'Alexander Cross',
    email: 'admin@cineverse.com',
    password: 'Admin@123456',
    role: 'admin',
    phone: '+1 234 567 8901',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    isEmailVerified: true,
  });

  const demoUser = await User.create({
    name: 'Sarah Connor',
    email: 'user@cineverse.com',
    password: 'User@123456',
    role: 'user',
    phone: '+1 987 654 3210',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    isEmailVerified: true,
  });

  // 2. Seed Genres
  logger.info('Seeding genres...');
  const genreList = [
    { name: 'Action', slug: 'action', description: 'High energy, stunts, and heroic battles' },
    { name: 'Adventure', slug: 'adventure', description: 'Exciting journeys, exploration, and quests' },
    { name: 'Sci-Fi', slug: 'sci-fi', description: 'Futuristic concepts, science, and outer space' },
    { name: 'Drama', slug: 'drama', description: 'Emotionally driven realistic character stories' },
    { name: 'Animation', slug: 'animation', description: 'Artistic animated storytelling for all ages' },
    { name: 'Comedy', slug: 'comedy', description: 'Humorous narratives designed to entertain' },
    { name: 'Horror', slug: 'horror', description: 'Thrills, psychological fear, and the supernatural' },
    { name: 'Thriller', slug: 'thriller', description: 'High suspense, crime, and mystery' },
  ];
  const createdGenres = await Genre.insertMany(genreList);
  const genreMap = {};
  createdGenres.forEach((g) => {
    genreMap[g.name] = g._id;
  });

  // 3. Seed Movies
  logger.info('Seeding blockbuster movies...');
  const moviesData = [
    {
      title: 'Dune: Part Two',
      slug: 'dune-part-two',
      synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
      genres: [genreMap['Action'], genreMap['Sci-Fi'], genreMap['Adventure']],
      languages: ['English', 'French'],
      durationInMinutes: 166,
      releaseDate: new Date('2024-03-01'),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
      censorRating: 'PG-13',
      ratingAverage: 8.9,
      ratingCount: 1420,
      cast: [
        { name: 'Timothée Chalamet', role: 'Paul Atreides' },
        { name: 'Zendaya', role: 'Chani' },
        { name: 'Rebecca Ferguson', role: 'Lady Jessica' },
        { name: 'Javier Bardem', role: 'Stilgar' },
      ],
      crew: [{ name: 'Denis Villeneuve', role: 'Director' }],
    },
    {
      title: 'Oppenheimer',
      slug: 'oppenheimer',
      synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, chronicling both the triumph of intellect and the haunting moral aftermath.',
      genres: [genreMap['Drama'], genreMap['Thriller']],
      languages: ['English', 'German'],
      durationInMinutes: 180,
      releaseDate: new Date('2023-07-21'),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
      censorRating: 'R',
      ratingAverage: 8.9,
      ratingCount: 2200,
      cast: [
        { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer' },
        { name: 'Emily Blunt', role: 'Katherine Oppenheimer' },
        { name: 'Matt Damon', role: 'Leslie Groves' },
        { name: 'Robert Downey Jr.', role: 'Lewis Strauss' },
      ],
      crew: [{ name: 'Christopher Nolan', role: 'Director' }],
    },
    {
      title: 'Spider-Man: Across the Spider-Verse',
      slug: 'spider-man-across-the-spider-verse',
      synopsis: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
      genres: [genreMap['Animation'], genreMap['Action'], genreMap['Sci-Fi']],
      languages: ['English', 'Spanish'],
      durationInMinutes: 140,
      releaseDate: new Date('2023-06-02'),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
      censorRating: 'PG-13',
      ratingAverage: 8.7,
      ratingCount: 1850,
      cast: [
        { name: 'Shameik Moore', role: 'Miles Morales' },
        { name: 'Hailee Steinfeld', role: 'Gwen Stacy' },
        { name: 'Oscar Isaac', role: 'Miguel O’Hara' },
      ],
      crew: [{ name: 'Joaquim Dos Santos', role: 'Director' }],
    },
    {
      title: 'Interstellar: 10th Anniversary',
      slug: 'interstellar-10th-anniversary',
      synopsis: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
      genres: [genreMap['Sci-Fi'], genreMap['Drama']],
      languages: ['English'],
      durationInMinutes: 169,
      releaseDate: new Date('2024-09-27'),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
      censorRating: 'PG-13',
      ratingAverage: 8.9,
      ratingCount: 3100,
      cast: [
        { name: 'Matthew McConaughey', role: 'Cooper' },
        { name: 'Anne Hathaway', role: 'Brand' },
        { name: 'Jessica Chastain', role: 'Murph' },
      ],
      crew: [{ name: 'Christopher Nolan', role: 'Director' }],
    },
    {
      title: 'Deadpool & Wolverine',
      slug: 'deadpool-and-wolverine',
      synopsis: 'Wolverine is recovering from his injuries when he crosses paths with the loudmouth Deadpool. They team up to defeat a common enemy in a multiverse-shattering adventure packed with adrenaline and humor.',
      genres: [genreMap['Action'], genreMap['Comedy'], genreMap['Sci-Fi']],
      languages: ['English'],
      durationInMinutes: 127,
      releaseDate: new Date('2024-07-26'),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      posterUrl: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?auto=format&fit=crop&w=600&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
      censorRating: 'R',
      ratingAverage: 8.2,
      ratingCount: 980,
      cast: [
        { name: 'Ryan Reynolds', role: 'Wade Wilson / Deadpool' },
        { name: 'Hugh Jackman', role: 'Logan / Wolverine' },
        { name: 'Emma Corrin', role: 'Cassandra Nova' },
      ],
      crew: [{ name: 'Shawn Levy', role: 'Director' }],
    },
    {
      title: 'A Quiet Place: Day One',
      slug: 'a-quiet-place-day-one',
      synopsis: 'Experience the day the world went quiet in this terrifying origins story set in New York City when ultrasonic bloodthirsty extraterrestrial predators first arrive on planet Earth.',
      genres: [genreMap['Horror'], genreMap['Thriller'], genreMap['Sci-Fi']],
      languages: ['English'],
      durationInMinutes: 99,
      releaseDate: new Date('2024-06-28'),
      endDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      posterUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=YPY7J-flzE8',
      censorRating: 'PG-13',
      ratingAverage: 7.4,
      ratingCount: 420,
      cast: [
        { name: 'Lupita Nyong\'o', role: 'Sam' },
        { name: 'Joseph Quinn', role: 'Eric' },
        { name: 'Alex Wolff', role: 'Reuben' },
      ],
      crew: [{ name: 'Michael Sarnoski', role: 'Director' }],
    },
  ];

  const createdMovies = await Movie.insertMany(moviesData);

  // 4. Seed Cinemas
  logger.info('Seeding premier cinemas across major cities...');
  const cinemasData = [
    {
      name: 'CineVerse Grand IMAX',
      slug: 'cineverse-grand-imax-new-york',
      address: {
        street: '1540 Broadway, Times Square',
        city: 'New York',
        state: 'NY',
        zipCode: '10036',
        country: 'USA',
        geoCoordinates: { lat: 40.758, lng: -73.9855 },
      },
      amenities: ['IMAX with Laser', 'Dolby Atmos 128-channel', 'VIP Lounge', 'Recliner Luxury', 'Valet Parking'],
      contactPhone: '+1 212 555 0199',
      contactEmail: 'timessquare@cineverse.com',
    },
    {
      name: 'Starlight Multiplex & Suites',
      slug: 'starlight-multiplex-los-angeles',
      address: {
        street: '6801 Hollywood Blvd',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90028',
        country: 'USA',
        geoCoordinates: { lat: 34.1016, lng: -118.3411 },
      },
      amenities: ['Dolby Cinema', 'In-seat Dining', 'Full Bar', 'Recliner Seats', 'Wheelchair Accessible'],
      contactPhone: '+1 323 555 0144',
      contactEmail: 'hollywood@cineverse.com',
    },
    {
      name: 'Oasis Luxury Cineplex',
      slug: 'oasis-luxury-cineplex-chicago',
      address: {
        street: '600 E Grand Ave, Navy Pier',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60611',
        country: 'USA',
        geoCoordinates: { lat: 41.8917, lng: -87.6086 },
      },
      amenities: ['RealD 3D', 'Dolby Atmos', 'Gourmet Popcorn Bar', 'Heated Recliners', 'Game Zone'],
      contactPhone: '+1 312 555 0188',
      contactEmail: 'chicago@cineverse.com',
    },
  ];

  const createdCinemas = await Cinema.insertMany(cinemasData);

  // Helper to generate seat layout for screen
  const createSeatGrid = (rows = 6, cols = 8) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seats = [];
    for (let r = 0; r < rows; r++) {
      const row = letters[r];
      let category = SEAT_CATEGORIES.REGULAR;
      if (r >= rows - 2) category = SEAT_CATEGORIES.RECLINER;
      else if (r >= 2) category = SEAT_CATEGORIES.PREMIUM;

      for (let c = 1; c <= cols; c++) {
        seats.push({
          seatNumber: `${row}${c}`,
          row,
          column: c,
          category,
          isActive: true,
        });
      }
    }
    return seats;
  };

  // 5. Seed Screens for each Cinema
  logger.info('Seeding auditoriums & seating layouts...');
  const screens = [];
  for (const cinema of createdCinemas) {
    // Screen 1: IMAX Hall (7 rows x 9 cols = 63 seats)
    const seats1 = createSeatGrid(7, 9);
    const screen1 = await Screen.create({
      cinemaId: cinema._id,
      screenNumber: 1,
      screenName: 'Auditorium 1 - IMAX Laser',
      soundSystem: 'Dolby Atmos 128-Channel',
      projectionType: 'IMAX 2D',
      layout: {
        totalRows: 7,
        totalColumns: 9,
        seats: seats1,
      },
      totalCapacity: seats1.length,
    });
    screens.push(screen1);

    // Screen 2: Dolby Cinema Hall (6 rows x 8 cols = 48 seats)
    const seats2 = createSeatGrid(6, 8);
    const screen2 = await Screen.create({
      cinemaId: cinema._id,
      screenNumber: 2,
      screenName: 'Auditorium 2 - Dolby Suite',
      soundSystem: 'Dolby Atmos 7.1',
      projectionType: '4K Laser',
      layout: {
        totalRows: 6,
        totalColumns: 8,
        seats: seats2,
      },
      totalCapacity: seats2.length,
    });
    screens.push(screen2);
  }

  // 6. Seed Shows (for today, tomorrow, and day after)
  logger.info('Seeding shows and schedule instances...');
  const showTimesSlots = [
    { hour: 11, minute: 0 },
    { hour: 14, minute: 30 },
    { hour: 18, minute: 15 },
    { hour: 21, minute: 30 },
  ];

  const pricingTiers = [
    { category: SEAT_CATEGORIES.REGULAR, price: 12.5 },
    { category: SEAT_CATEGORIES.PREMIUM, price: 16.0 },
    { category: SEAT_CATEGORIES.RECLINER, price: 21.0 },
  ];

  const pricingMap = {
    [SEAT_CATEGORIES.REGULAR]: 12.5,
    [SEAT_CATEGORIES.PREMIUM]: 16.0,
    [SEAT_CATEGORIES.RECLINER]: 21.0,
  };

  const createdShows = [];
  const today = new Date();

  for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
    const showDate = new Date(today);
    showDate.setDate(today.getDate() + dayOffset);
    showDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < screens.length; i++) {
      const screen = screens[i];
      const movie = createdMovies[i % createdMovies.length];

      for (let sIdx = 0; sIdx < showTimesSlots.length; sIdx++) {
        const slot = showTimesSlots[sIdx];
        const startTime = new Date(showDate);
        startTime.setHours(slot.hour, slot.minute, 0, 0);
        const endTime = new Date(startTime.getTime() + (movie.durationInMinutes + 20) * 60 * 1000);

        // Pre-populate show seats from screen template
        const showSeats = screen.layout.seats.map((seat) => ({
          seatNumber: seat.seatNumber,
          row: seat.row,
          column: seat.column,
          category: seat.category,
          price: pricingMap[seat.category] || 12.5,
          status: SEAT_STATUS.AVAILABLE,
          lockedBy: null,
          lockExpiresAt: null,
          bookingId: null,
        }));

        // For demonstration realism: reserve 2-3 seats randomly in the first show
        if (dayOffset === 0 && sIdx === 0 && showSeats.length > 5) {
          showSeats[2].status = SEAT_STATUS.BOOKED;
          showSeats[3].status = SEAT_STATUS.BOOKED;
        }

        const show = await Show.create({
          movieId: movie._id,
          cinemaId: screen.cinemaId,
          screenId: screen._id,
          showDate,
          startTime,
          endTime,
          format: screen.projectionType.includes('IMAX') ? 'IMAX 2D' : '2D',
          language: movie.languages[0] || 'English',
          categoryPricing: pricingTiers,
          seats: showSeats,
          totalSeats: showSeats.length,
          availableSeatsCount: showSeats.filter((s) => s.status === SEAT_STATUS.AVAILABLE).length,
        });

        createdShows.push(show);
      }
    }
  }

  // 7. Seed Sample Confirmed Booking for Demo User
  logger.info('Seeding sample confirmed booking for demo user...');
  const sampleShow = createdShows[0];
  const sampleMovie = createdMovies[0];
  const sampleCinema = createdCinemas[0];
  const sampleScreen = screens[0];

  const sampleBooking = await Booking.create({
    bookingNumber: 'CV-20241018-DEMO1',
    userId: demoUser._id,
    showId: sampleShow._id,
    movieId: sampleMovie._id,
    cinemaId: sampleCinema._id,
    screenId: sampleScreen._id,
    seats: [
      { seatNumber: 'C4', category: 'Premium', price: 16.0 },
      { seatNumber: 'C5', category: 'Premium', price: 16.0 },
    ],
    subtotal: 32.0,
    convenienceFee: 3.0,
    taxes: 2.8,
    totalAmount: 37.8,
    paymentStatus: PAYMENT_STATUS.COMPLETED,
    bookingStatus: BOOKING_STATUS.CONFIRMED,
    qrCodeUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await Payment.create({
    bookingId: sampleBooking._id,
    userId: demoUser._id,
    amount: 37.8,
    currency: 'USD',
    provider: 'MOCK',
    orderId: 'ORD-SAMPLE-9901',
    transactionId: 'TXN-SAMPLE-4412',
    status: PAYMENT_STATUS.SUCCESS,
    paymentMethod: 'card',
  });

  logger.success('✅ CineVerse Database successfully populated with high-quality seed data!');
  logger.info(`Admin Credentials: admin@cineverse.com / Admin@123456`);
  logger.info(`User Credentials: user@cineverse.com / User@123456`);
};
