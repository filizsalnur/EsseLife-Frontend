import useSWR from 'swr';
import {fetcherForGet} from './api';

export function useResourceQuery(resourceName: string, id: number) {
    const queryParam = `query?id=${id}`;
    const { data, error, isLoading } = useSWR(`/${resourceName}/${queryParam}`, fetcherForGet);

    return {
        resourceData: data,
        isLoading: !error && !data,
        isError: error,
    };
}