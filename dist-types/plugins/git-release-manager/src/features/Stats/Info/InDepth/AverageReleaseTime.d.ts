/// <reference types="react" />
import { useGetReleaseTimes } from '../hooks/useGetReleaseTimes';
export declare function AverageReleaseTime({ averageReleaseTime, }: {
    averageReleaseTime: ReturnType<typeof useGetReleaseTimes>['averageReleaseTime'];
}): JSX.Element;
