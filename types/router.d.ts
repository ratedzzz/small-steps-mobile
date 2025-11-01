/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams:
        | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams }
        | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams }
        | { pathname: `/`; params?: Router.UnknownInputParams; }
        | { pathname: `/modal`; params?: Router.UnknownInputParams; }
        | { pathname: `/week`; params?: Router.UnknownInputParams; }
        | { pathname: `/../src/components/NewItemButtons`; params?: Router.UnknownInputParams; }
        | { pathname: `/../src/screens/EditHabitScreen`; params: Router.UnknownInputParams & { id: string | number } }
        | { pathname: `/../src/screens/EditGoalScreen`; params: Router.UnknownInputParams & { id: string | number } }
        | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; }
        | { pathname: `${'/(tabs)'}` | `/`; params?: Router.UnknownInputParams; }
        | { pathname: `${'/(tabs)'}/two` | `/two`; params?: Router.UnknownInputParams; }
        | { pathname: `/+not-found`, params: Router.UnknownInputParams & {} }
        | { pathname: `/day/[date]`, params: Router.UnknownInputParams & { date: string | number; } };
      hrefOutputParams:
        | { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams }
        | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams }
        | { pathname: `/`; params?: Router.UnknownOutputParams; }
        | { pathname: `/modal`; params?: Router.UnknownOutputParams; }
        | { pathname: `/week`; params?: Router.UnknownOutputParams; }
        | { pathname: `/../src/components/NewItemButtons`; params?: Router.UnknownOutputParams; }
        | { pathname: `/../src/screens/EditHabitScreen`; params: Router.UnknownOutputParams & { id: string } }
        | { pathname: `/../src/screens/EditGoalScreen`; params: Router.UnknownOutputParams & { id: string } }
        | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; }
        | { pathname: `${'/(tabs)'}` | `/`; params?: Router.UnknownOutputParams; }
        | { pathname: `${'/(tabs)'}/two` | `/two`; params?: Router.UnknownOutputParams; }
        | { pathname: `/+not-found`, params: Router.UnknownOutputParams & {} }
        | { pathname: `/day/[date]`, params: Router.UnknownOutputParams & { date: string; } };
      href:
        | Router.RelativePathString
        | Router.ExternalPathString
        | `/${`?${string}` | `#${string}` | ''}`
        | `/modal${`?${string}` | `#${string}` | ''}`
        | `/week${`?${string}` | `#${string}` | ''}`
        | `/../src/components/NewItemButtons${`?${string}` | `#${string}` | ''}`
        | `/../src/screens/EditHabitScreen${`?${string}` | `#${string}` | ''}`
        | `/../src/screens/EditGoalScreen${`?${string}` | `#${string}` | ''}`
        | `/_sitemap${`?${string}` | `#${string}` | ''}`
        | `${'/(tabs)'}${`?${string}` | `#${string}` | ''}`
        | `/${`?${string}` | `#${string}` | ''}`
        | `${'/(tabs)'}/two${`?${string}` | `#${string}` | ''}`
        | `/two${`?${string}` | `#${string}` | ''}`
        | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams }
        | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams }
        | { pathname: `/`; params?: Router.UnknownInputParams; }
        | { pathname: `/modal`; params?: Router.UnknownInputParams; }
        | { pathname: `/week`; params?: Router.UnknownInputParams; }
        | { pathname: `/../src/components/NewItemButtons`; params?: Router.UnknownInputParams; }
        | { pathname: `/../src/screens/EditHabitScreen`; params: Router.UnknownInputParams & { id: string | number } }
        | { pathname: `/../src/screens/EditGoalScreen`; params: Router.UnknownInputParams & { id: string | number } }
        | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; }
        | { pathname: `${'/(tabs)'}` | `/`; params?: Router.UnknownInputParams; }
        | { pathname: `${'/(tabs)'}/two` | `/two`; params?: Router.UnknownInputParams; }
        | `/+not-found${`?${string}` | `#${string}` | ''}`
        | `/day/${Router.SingleRoutePart<T>}${`?${string}` | `#${string}` | ''}`
        | { pathname: `/+not-found`, params: Router.UnknownInputParams & {} }
        | { pathname: `/day/[date]`, params: Router.UnknownInputParams & { date: string | number; } };
    }
  }
}
