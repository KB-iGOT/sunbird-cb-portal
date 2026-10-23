import { Observable } from 'rxjs'

// Local stand-ins for the leaderboard model and service this component was written against;
// neither exists in this repo. The component is not declared in any module, so these only
// need to describe what it and its template use so that it type-checks.
export type EDurationTypeRouteParam = string

export type ILeaderboardPrevNext = Record<string, unknown>

export interface ILeaderboard {
  start_date: string
  end_date: string
  lastUpdatedDate: string
  prev: ILeaderboardPrevNext | null
  next: ILeaderboardPrevNext | null
}

export type IHallOfFameItem = Record<string, unknown>

export abstract class LeaderboardService {
  abstract getLeaderboard(durationType: EDurationTypeRouteParam, prevNext?: ILeaderboardPrevNext): Observable<ILeaderboard>
}
