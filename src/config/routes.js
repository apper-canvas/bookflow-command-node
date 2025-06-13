import BrowseBooks from '@/components/pages/BrowseBooks'
import MyLoans from '@/components/pages/MyLoans'
import History from '@/components/pages/History'
import Search from '@/components/pages/Search'

export const routes = {
  browse: {
    id: 'browse',
    label: 'Browse Books',
    path: '/browse',
    icon: 'Library',
    component: BrowseBooks
  },
  loans: {
    id: 'loans',
    label: 'My Loans',
    path: '/loans',
    icon: 'BookOpen',
    component: MyLoans
  },
  history: {
    id: 'history',
    label: 'History',
    path: '/history',
    icon: 'History',
    component: History
  },
  search: {
    id: 'search', 
    label: 'Search',
    path: '/search',
    icon: 'Search',
    component: Search
  }
}

export const routeArray = Object.values(routes)